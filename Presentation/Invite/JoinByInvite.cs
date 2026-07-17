namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: người có link bấm "Tham gia nhóm".
///  - Link không match/thu hồi/hết hạn → BadRequest (thông điệp an toàn, không lộ nhóm).
///  - Đã là thành viên → trả "member" (idempotent, không side-effect).
///  - Nhóm bật duyệt → push JoinRequest (guarded, chống trùng) + produce NotifyJoinRequest → "pending".
///  - Nhóm vào thẳng → produce Kafka NewMember (ViaInvite) — member persist + system message
///    + fanout realtime đi theo pipeline member.new sẵn có; produce NotifyMemberJoinedByLink → "joined".
/// Thông báo cho quản trị (Notification bền + FCM) tách sang NotificationConsumer — handler chỉ
/// produce, request path không chờ persist notification / gọi Firebase.
/// FE sau "joined" chờ event NewMembers đẩy hội thoại vào danh sách (persist là async).
/// </summary>
public static class JoinByInvite
{
    public record Request(string code) : IRequest<Response>;

    // Status: "joined" | "pending" | "member"
    public record Response(string Status, string? ConversationId, string? Title);

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.code).NotEmpty().MaximumLength(64);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Response>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IUnitOfWork _uow;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository,
            IConversationRepository conversationRepository, IUnitOfWork uow, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _uow = uow;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq("Invite.Code", request.code),
                Builders<Conversation>.Filter.Eq(c => c.IsGroup, true));
            var conversation = await _conversationRepository.GetItemAsync(filter);
            if (conversation?.Invite is null)
                throw new BadRequestException("Invite link is invalid or has been revoked");
            if (conversation.Invite.ExpireTime is not null && conversation.Invite.ExpireTime < DateTime.UtcNow)
                throw new BadRequestException("Invite link has expired");

            var userId = _contactRepository.GetUserId();
            var member = conversation.Members.FirstOrDefault(m => m.ContactId == userId);
            if (member is not null && !member.IsDeleted)
                return new Response("member", conversation.Id, conversation.Title);

            // Quản trị cần được báo — snapshot tại request time, consumer không phải re-read.
            var moderatorIds = conversation.Members
                .Where(m => m.IsModerator && !m.IsDeleted && m.ContactId != userId)
                .Select(m => m.ContactId).ToArray();

            if (conversation.Invite.RequireApproval)
            {
                // Đã có yêu cầu chờ → idempotent, không push/notify lại (chống spam quản trị).
                if (conversation.JoinRequests.Any(r => r.ContactId == userId))
                    return new Response("pending", null, conversation.Title);

                // Guarded push: filter $not elemMatch chống double-request khi 2 thiết bị
                // cùng bấm đồng thời (race window sau lần đọc ở trên) — không match = no-op.
                var pushFilter = Builders<Conversation>.Filter.And(
                    MongoQuery<Conversation>.IdFilter(conversation.Id),
                    Builders<Conversation>.Filter.Not(
                        Builders<Conversation>.Filter.ElemMatch(c => c.JoinRequests, r => r.ContactId == userId)));
                _conversationRepository.UpdateNoTrackingTime(pushFilter,
                    Builders<Conversation>.Update.Push(c => c.JoinRequests, new JoinRequest { ContactId = userId }));
                await _uow.SaveAsync();

                // Notification bền + FCM cho quản trị xử lý ở NotificationConsumer.
                if (moderatorIds.Length > 0)
                    await _kafkaProducer.ProduceAsync(Topic.NotifyJoinRequest, new NotifyInviteModel
                    {
                        UserId = userId,
                        ConversationId = conversation.Id,
                        Title = conversation.Title,
                        ModeratorIds = moderatorIds
                    });

                return new Response("pending", null, conversation.Title);
            }

            // Vào thẳng — tái dùng pipeline member.new (persist + system message + cache + fanout).
            // ViaInvite: system message "joined via invite link" + reopen member cũ đã rời nhóm.
            await _kafkaProducer.ProduceAsync(Topic.NewMember, new NewMemberModel
            {
                UserId = userId,
                ConversationId = conversation.Id,
                Members = new[] { userId },
                ViaInvite = true
            });

            // Vào thẳng không có ai duyệt → không ai được báo. Notification bền + FCM banner cho
            // quản trị xử lý ở NotificationConsumer — produce SAU NewMember để join là việc chắc
            // chắn xảy ra trước; notify lỗi thì join vẫn thành công.
            if (moderatorIds.Length > 0)
                await _kafkaProducer.ProduceAsync(Topic.NotifyMemberJoinedByLink, new NotifyInviteModel
                {
                    UserId = userId,
                    ConversationId = conversation.Id,
                    Title = conversation.Title,
                    ModeratorIds = moderatorIds
                });

            return new Response("joined", conversation.Id, conversation.Title);
        }
    }
}

public class JoinByInviteEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Invite).MapPost("/{code}/join",
        async (ISender sender, string code) =>
        {
            var result = await sender.Send(new JoinByInvite.Request(code));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
