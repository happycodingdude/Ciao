namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: người có link bấm "Tham gia nhóm".
///  - Link không match/thu hồi/hết hạn → BadRequest (thông điệp an toàn, không lộ nhóm).
///  - Đã là thành viên → trả "member" (idempotent, không side-effect).
///  - Nhóm bật duyệt → push JoinRequest (guarded, chống trùng) + notify quản trị → "pending".
///  - Nhóm vào thẳng → produce Kafka NewMember (ViaInvite) — member persist + system message
///    + fanout realtime đi theo pipeline member.new sẵn có → "joined".
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
        readonly INotificationRepository _notificationRepository;
        readonly IUnitOfWork _uow;
        readonly IKafkaProducer _kafkaProducer;
        readonly IFirebaseFunction _firebase;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository,
            IConversationRepository conversationRepository, INotificationRepository notificationRepository,
            IUnitOfWork uow, IKafkaProducer kafkaProducer, IFirebaseFunction firebase)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _notificationRepository = notificationRepository;
            _uow = uow;
            _kafkaProducer = kafkaProducer;
            _firebase = firebase;
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

                // Notification bền cho từng quản trị (đọc lại ở trang thông báo).
                var requester = await _contactRepository.GetInfoAsync(userId);
                var moderatorIds = conversation.Members
                    .Where(m => m.IsModerator && !m.IsDeleted && m.ContactId != userId)
                    .Select(m => m.ContactId).ToArray();
                foreach (var moderatorId in moderatorIds)
                    _notificationRepository.Add(new Notification
                    {
                        SourceId = conversation.Id,
                        SourceType = AppConstants.NotificationSourceType_JoinRequest,
                        Content = $"{requester?.Name} requested to join {conversation.Title}",
                        ContactId = moderatorId,
                        ActorName = requester?.Name ?? "",
                        ActorAvatar = requester?.Avatar ?? "",
                        Action = "requested to join the group",
                        Preview = conversation.Title
                    });
                await _uow.SaveAsync();

                // Realtime — fire-and-forget: fail thì quản trị vẫn thấy khi mở panel/notification.
                if (moderatorIds.Length > 0)
                    _ = _firebase.Notify(ChatEventNames.JoinRequestUpdated, moderatorIds,
                        new { ConversationId = conversation.Id });

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
