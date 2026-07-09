namespace Presentation.Bookmarks;

/// <summary>
/// Danh sách messageId đã bookmark của user TRONG một hội thoại — FE dùng để
/// hiển thị trạng thái "đã lưu" trên từng tin mà không cần tải toàn bộ bookmark.
/// </summary>
public static class GetConversationBookmarkIds
{
    public record Request(string conversationId) : IRequest<List<string>>;

    internal sealed class Handler : IRequestHandler<Request, List<string>>
    {
        readonly IContactRepository _contactRepository;
        readonly IBookmarkRepository _bookmarkRepository;

        public Handler(IContactRepository contactRepository, IBookmarkRepository bookmarkRepository)
        {
            _contactRepository = contactRepository;
            _bookmarkRepository = bookmarkRepository;
        }

        public async Task<List<string>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var filter = Builders<Bookmark>.Filter.And(
                Builders<Bookmark>.Filter.Eq(q => q.ContactId, userId),
                Builders<Bookmark>.Filter.Eq(q => q.ConversationId, request.conversationId));
            var bookmarks = await _bookmarkRepository.GetAllAsync(filter);
            return bookmarks.Select(q => q.MessageId).ToList();
        }
    }
}

public class GetConversationBookmarkIdsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/bookmarks",
        async (ISender sender, string conversationId) =>
        {
            var result = await sender.Send(new GetConversationBookmarkIds.Request(conversationId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
