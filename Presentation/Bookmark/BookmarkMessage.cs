namespace Presentation.Bookmarks;

/// <summary>
/// Lưu / bỏ lưu tin nhắn (riêng tư, per-user). Idempotent:
/// - bookmarked=true khi đã tồn tại → giữ nguyên (không tạo trùng).
/// - bookmarked=false khi không tồn tại → no-op.
/// Không fanout realtime: bookmark là dữ liệu cá nhân, người khác không thấy.
/// </summary>
public static class BookmarkMessage
{
    public record Request(string conversationId, string id, bool bookmarked) : IRequest<Unit>;

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
        readonly IContactRepository _contactRepository;
        readonly IBookmarkRepository _bookmarkRepository;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IBookmarkRepository bookmarkRepository)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _bookmarkRepository = bookmarkRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var filter = Builders<Bookmark>.Filter.And(
                Builders<Bookmark>.Filter.Eq(q => q.ContactId, userId),
                Builders<Bookmark>.Filter.Eq(q => q.MessageId, request.id));

            if (request.bookmarked)
            {
                var existing = await _bookmarkRepository.GetItemAsync(filter);
                if (existing is null)
                {
                    _bookmarkRepository.Add(new Bookmark
                    {
                        ContactId = userId,
                        ConversationId = request.conversationId,
                        MessageId = request.id
                    });
                }
            }
            else
            {
                _bookmarkRepository.DeleteOne(filter);
            }

            return Unit.Value;
        }
    }
}

public class BookmarkMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/bookmark",
        async (ISender sender, string conversationId, string id, bool bookmarked) =>
        {
            await sender.Send(new BookmarkMessage.Request(conversationId, id, bookmarked));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
