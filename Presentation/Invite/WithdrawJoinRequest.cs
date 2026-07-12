namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: người xin RÚT yêu cầu tham gia của chính mình trước khi được duyệt.
/// Lookup theo code (người xin chưa là thành viên, chỉ giữ link — không có conversationId).
/// Pull theo (Invite.Code, userId) — idempotent: đã được duyệt/từ chối trước đó thì no-op.
/// Hạn chế chấp nhận: link bị thu hồi sau khi gửi yêu cầu → không rút qua UI được nữa,
/// nhưng quản trị vẫn thấy và xử lý được yêu cầu trong hàng chờ.
/// </summary>
public static class WithdrawJoinRequest
{
    public record Request(string code) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.code).NotEmpty().MaximumLength(64);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IUnitOfWork _uow;
        readonly IFirebaseFunction _firebase;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository,
            IConversationRepository conversationRepository, IUnitOfWork uow, IFirebaseFunction firebase)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _uow = uow;
            _firebase = firebase;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var conversation = await _conversationRepository.GetItemAsync(
                Builders<Conversation>.Filter.Eq("Invite.Code", request.code));
            if (conversation is null || !conversation.JoinRequests.Any(r => r.ContactId == userId))
                return Unit.Value; // link đổi/thu hồi hoặc yêu cầu đã được xử lý → no-op

            _conversationRepository.UpdateNoTrackingTime(
                MongoQuery<Conversation>.IdFilter(conversation.Id),
                Builders<Conversation>.Update.PullFilter(c => c.JoinRequests, r => r.ContactId == userId));
            await _uow.SaveAsync();

            // Quản trị refresh hàng chờ — fire-and-forget.
            var moderatorIds = conversation.Members
                .Where(m => m.IsModerator && !m.IsDeleted)
                .Select(m => m.ContactId).ToArray();
            if (moderatorIds.Length > 0)
                _ = _firebase.Notify(ChatEventNames.JoinRequestUpdated, moderatorIds,
                    new { ConversationId = conversation.Id });

            return Unit.Value;
        }
    }
}

public class WithdrawJoinRequestEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Invite).MapDelete("/{code}/join",
        async (ISender sender, string code) =>
        {
            await sender.Send(new WithdrawJoinRequest.Request(code));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
