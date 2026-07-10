namespace Presentation.Bookmarks;

/// <summary>
/// Danh sách "Tin nhắn đã lưu" của user TRONG một hội thoại (panel Bookmark ở khung chat).
/// Nội dung tin resolve LIVE từ message cache → phản ánh edit/recall mới nhất.
/// keyword (optional): lọc theo nội dung tin (case-insensitive) — dùng khi FE không tìm thấy
/// trong danh sách đã tải sẵn; tin unavailable bị loại khi có keyword vì không còn nội dung để khớp.
/// </summary>
public static class GetConversationBookmarks
{
    public record Request(string conversationId, string? keyword) : IRequest<List<BookmarkItemResponse>>;

    internal sealed class Handler : IRequestHandler<Request, List<BookmarkItemResponse>>
    {
        readonly IContactRepository _contactRepository;
        readonly IBookmarkRepository _bookmarkRepository;
        readonly MessageCache _messageCache;
        readonly MemberCache _memberCache;
        readonly ConversationCache _conversationCache;

        public Handler(IContactRepository contactRepository, IBookmarkRepository bookmarkRepository, MessageCache messageCache, MemberCache memberCache, ConversationCache conversationCache)
        {
            _contactRepository = contactRepository;
            _bookmarkRepository = bookmarkRepository;
            _messageCache = messageCache;
            _memberCache = memberCache;
            _conversationCache = conversationCache;
        }

        public async Task<List<BookmarkItemResponse>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var filter = Builders<Bookmark>.Filter.And(
                Builders<Bookmark>.Filter.Eq(q => q.ContactId, userId),
                Builders<Bookmark>.Filter.Eq(q => q.ConversationId, request.conversationId));
            var bookmarks = (await _bookmarkRepository.GetAllAsync(filter))
                .OrderByDescending(q => q.CreatedTime)
                .ToList();
            if (!bookmarks.Any()) return new List<BookmarkItemResponse>();

            var conversationInfo = await _conversationCache.GetConversationInfo(request.conversationId);
            var members = await _memberCache.GetMembers(request.conversationId);
            var messages = await _messageCache.GetMessages(request.conversationId);

            // Title hội thoại direct = tên đối phương (cache Title có thể rỗng với chat 1-1).
            var title = conversationInfo?.Title;
            if (string.IsNullOrEmpty(title) && conversationInfo is { IsGroup: false } && members is not null)
                title = members.FirstOrDefault(q => q.Contact.Id != userId)?.Contact.Name;

            var result = new List<BookmarkItemResponse>();
            var keyword = request.keyword?.Trim();
            foreach (var bookmark in bookmarks)
            {
                var message = messages?.SingleOrDefault(q => q.Id == bookmark.MessageId);
                var sender = message is null ? null : members?.SingleOrDefault(q => q.Contact.Id == message.ContactId);
                var isUnavailable = message is null || message.RecalledTime is not null;
                var content = isUnavailable ? string.Empty : message!.Content;

                if (!string.IsNullOrEmpty(keyword)
                    && (isUnavailable || !content.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                    continue;

                result.Add(new BookmarkItemResponse
                {
                    Id = bookmark.Id,
                    ConversationId = bookmark.ConversationId,
                    ConversationTitle = title ?? string.Empty,
                    IsGroup = conversationInfo?.IsGroup ?? false,
                    MessageId = bookmark.MessageId,
                    MessageType = message?.Type ?? string.Empty,
                    Content = content,
                    SenderId = message?.ContactId ?? string.Empty,
                    SenderName = sender?.Contact.Name ?? string.Empty,
                    SenderAvatar = sender?.Contact.Avatar,
                    MessageCreatedTime = message?.CreatedTime,
                    BookmarkedTime = bookmark.CreatedTime,
                    IsUnavailable = isUnavailable
                });
            }
            return result;
        }
    }
}

public class GetConversationBookmarksEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // GET /api/v1/conversations/{conversationId}/bookmarks/messages?keyword=...
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/bookmarks/messages",
        async (ISender sender, string conversationId, string? keyword = null) =>
        {
            var result = await sender.Send(new GetConversationBookmarks.Request(conversationId, keyword));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
