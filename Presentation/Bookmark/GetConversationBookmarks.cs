namespace Presentation.Bookmarks;

/// <summary>
/// Panel "Tin nhắn đã lưu" của user TRONG một hội thoại — phân trang (mới lưu trước).
/// Nội dung resolve LIVE từ message cache → phản ánh edit/recall mới nhất; tin recall/mất → IsUnavailable.
/// - keyword rỗng: phân trang theo page/limit (dùng cho load-more).
/// - keyword có: chế độ search — resolve toàn bộ, lọc theo nội dung (FE fallback khi filter
///   client-side không match), trả toàn bộ match (HasMore=false); tin unavailable bị loại.
/// </summary>
public static class GetConversationBookmarks
{
    public record Request(string conversationId, int page, int limit, string? keyword) : IRequest<GetBookmarksResponse>;

    internal sealed class Handler : IRequestHandler<Request, GetBookmarksResponse>
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

        public async Task<GetBookmarksResponse> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var filter = Builders<Bookmark>.Filter.And(
                Builders<Bookmark>.Filter.Eq(q => q.ContactId, userId),
                Builders<Bookmark>.Filter.Eq(q => q.ConversationId, request.conversationId));

            var keyword = request.keyword?.Trim();
            var searchMode = !string.IsNullOrEmpty(keyword);

            // Search mode: nạp toàn bộ để lọc theo nội dung. Browse mode: phân trang + lấy dư 1
            // bản ghi để tính HasMore không cần count riêng.
            var paging = new PagingParam(request.page, request.limit);
            List<Bookmark> bookmarks;
            bool hasMore = false;
            if (searchMode)
            {
                bookmarks = (await _bookmarkRepository.GetAllAsync(filter))
                    .OrderByDescending(q => q.CreatedTime)
                    .ToList();
            }
            else
            {
                bookmarks = (await _bookmarkRepository.GetPagedAsync(filter,
                    new PagingParam(request.page, request.limit + 1))).ToList();
                hasMore = bookmarks.Count > paging.Limit;
                if (hasMore) bookmarks = bookmarks.Take(paging.Limit).ToList();
            }

            var result = new GetBookmarksResponse { HasMore = hasMore };
            if (bookmarks.Count == 0) return result;

            var conversationInfo = await _conversationCache.GetConversationInfo(request.conversationId);
            var members = await _memberCache.GetMembers(request.conversationId);
            var messages = await _messageCache.GetMessages(request.conversationId);

            // Title hội thoại direct = tên đối phương (cache Title có thể rỗng với chat 1-1).
            var title = conversationInfo?.Title;
            if (string.IsNullOrEmpty(title) && conversationInfo is { IsGroup: false } && members is not null)
                title = members.FirstOrDefault(q => q.Contact.Id != userId)?.Contact.Name;

            foreach (var bookmark in bookmarks)
            {
                var message = messages?.SingleOrDefault(q => q.Id == bookmark.MessageId);
                var sender = message is null ? null : members?.SingleOrDefault(q => q.Contact.Id == message.ContactId);
                var isUnavailable = message is null || message.RecalledTime is not null;
                var content = isUnavailable ? string.Empty : message!.Content;

                if (searchMode
                    && (isUnavailable || !content.Contains(keyword!, StringComparison.OrdinalIgnoreCase)))
                    continue;

                result.Bookmarks.Add(new BookmarkItemResponse
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
        // GET /api/v1/conversations/{conversationId}/bookmarks/messages?page=&limit=&keyword=
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/bookmarks/messages",
        async (ISender sender, string conversationId, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit, string? keyword = null) =>
        {
            var result = await sender.Send(new GetConversationBookmarks.Request(conversationId, page, limit, keyword));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
