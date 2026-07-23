namespace Presentation.Messages;

/// <summary>
/// Ghim / bỏ ghim tin nhắn (DÙNG CHUNG cho hội thoại — mọi thành viên thấy). Idempotent:
/// - pinned=true khi đã ghim → giữ nguyên (không tạo trùng).
/// - pinned=false khi chưa ghim → no-op.
/// Lưu ở collection PinnedMessage (top-level, per-conversation) thay vì cờ nhúng trên message.
/// Fanout realtime để mọi thành viên khác cập nhật trạng thái ghim của tin (badge + panel).
/// </summary>
public static class PinMessage
{
    public record Request(string conversationId, string id, bool pinned) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebaseFunction;
        readonly IContactRepository _contactRepository;
        readonly IPinnedMessageRepository _pinnedMessageRepository;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IPinnedMessageRepository pinnedMessageRepository, IFirebaseFunction firebaseFunction, MemberCache memberCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _pinnedMessageRepository = pinnedMessageRepository;
            _firebaseFunction = firebaseFunction;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var filter = Builders<PinnedMessage>.Filter.And(
                Builders<PinnedMessage>.Filter.Eq(q => q.ConversationId, request.conversationId),
                Builders<PinnedMessage>.Filter.Eq(q => q.MessageId, request.id));

            if (request.pinned)
            {
                var existing = await _pinnedMessageRepository.GetItemAsync(filter);
                if (existing is null)
                {
                    _pinnedMessageRepository.Add(new PinnedMessage
                    {
                        ConversationId = request.conversationId,
                        MessageId = request.id,
                        PinnedBy = userId
                    });
                }
            }
            else
            {
                _pinnedMessageRepository.DeleteOne(filter);
            }

            // Fanout realtime cho các thành viên khác → FE cập nhật cache pinned ids + panel.
            var members = await _memberCache.GetMembers(request.conversationId);
            await _firebaseFunction.Notify(
                ChatEventNames.NewMessagePinned,
                members.Where(q => q.Contact.Id != userId).Select(q => q.Contact.Id).ToArray(),
                new NotifyNewMessagePinnedModel
                {
                    UserId = userId,
                    ConversationId = request.conversationId,
                    MessageId = request.id,
                    IsPinned = request.pinned,
                    PinnedBy = userId
                });

            return Unit.Value;
        }
    }
}

public class PinMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/pin",
        async (ISender sender, string conversationId, string id, bool pinned) =>
        {
            var query = new PinMessage.Request(conversationId, id, pinned);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
