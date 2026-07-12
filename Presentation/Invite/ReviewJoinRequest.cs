namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: quản trị duyệt / từ chối một yêu cầu tham gia.
///  - Pull request khỏi hàng chờ (guarded theo ContactId — 2 quản trị duyệt đồng thời:
///    người sau không match → no-op; member add phía sau đã idempotent nên an toàn).
///  - Duyệt → produce Kafka NewMember (ViaInvite) — member persist + system message + fanout
///    theo pipeline sẵn có; người xin nhận hội thoại qua event NewMembers.
///  - Cả 2 nhánh → Notification bền cho người xin + FCM JoinRequestUpdated (người xin +
///    quản trị khác refresh hàng chờ).
/// </summary>
public static class ReviewJoinRequest
{
    public record Request(string conversationId, string contactId, bool approved) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.contactId).NotEmpty();
            RuleFor(c => c.conversationId).MustBeGroupModerator(contactRepository, conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
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

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(request.conversationId));
            if (!conversation.JoinRequests.Any(r => r.ContactId == request.contactId))
                throw new BadRequestException("Join request not found");

            var userId = _contactRepository.GetUserId();

            // Pull request khỏi hàng chờ. Idempotent: request đã bị pull (quản trị khác vừa xử lý)
            // → filter vẫn match conversation nhưng Pull không đổi gì.
            _conversationRepository.UpdateNoTrackingTime(
                MongoQuery<Conversation>.IdFilter(request.conversationId),
                Builders<Conversation>.Update.PullFilter(c => c.JoinRequests, r => r.ContactId == request.contactId));

            // Notification bền cho người xin — biết kết quả kể cả khi offline lúc duyệt.
            var moderator = await _contactRepository.GetInfoAsync(userId);
            _notificationRepository.Add(new Notification
            {
                SourceId = conversation.Id,
                SourceType = AppConstants.NotificationSourceType_JoinRequest,
                Content = request.approved
                    ? $"{moderator?.Name} approved your request to join {conversation.Title}"
                    : $"{moderator?.Name} declined your request to join {conversation.Title}",
                ContactId = request.contactId,
                ActorName = moderator?.Name ?? "",
                ActorAvatar = moderator?.Avatar ?? "",
                Action = request.approved ? "approved your request to join" : "declined your request to join",
                Preview = conversation.Title
            });
            await _uow.SaveAsync();

            if (request.approved)
                await _kafkaProducer.ProduceAsync(Topic.NewMember, new NewMemberModel
                {
                    UserId = request.contactId,
                    ConversationId = conversation.Id,
                    Members = new[] { request.contactId },
                    ViaInvite = true
                });

            // Realtime — fire-and-forget: người xin + các quản trị khác refresh hàng chờ/notification.
            var notifyIds = conversation.Members
                .Where(m => m.IsModerator && !m.IsDeleted && m.ContactId != userId)
                .Select(m => m.ContactId)
                .Append(request.contactId)
                .ToArray();
            _ = _firebase.Notify(ChatEventNames.JoinRequestUpdated, notifyIds,
                new { ConversationId = conversation.Id, Approved = request.approved });

            return Unit.Value;
        }
    }
}

public class ReviewJoinRequestEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("/{conversationId}/join-requests/{contactId}",
        async (ISender sender, string conversationId, string contactId, bool approved) =>
        {
            await sender.Send(new ReviewJoinRequest.Request(conversationId, contactId, approved));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
