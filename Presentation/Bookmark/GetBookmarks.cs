namespace Presentation.Bookmarks;

/// <summary>
/// Danh sách "Tin nhắn đã lưu" của user (mới lưu trước), phân trang.
/// Nội dung tin resolve LIVE từ message cache (Redis) theo từng conversation
/// → phản ánh edit/recall mới nhất; tin recall/mất → IsUnavailable (vẫn giữ mục để user tự bỏ lưu).
/// </summary>
public static class GetBookmarks
{
    public record Request(int page, int limit) : IRequest<GetBookmarksResponse>;

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
            var paging = new PagingParam(request.page, request.limit);
            var filter = Builders<Bookmark>.Filter.Eq(q => q.ContactId, userId);

            // Lấy dư 1 bản ghi để tính HasMore mà không cần count riêng.
            var bookmarks = (await _bookmarkRepository.GetPagedAsync(filter,
                new PagingParam(request.page, request.limit + 1))).ToList();
            var hasMore = bookmarks.Count > paging.Limit;
            if (hasMore) bookmarks = bookmarks.Take(paging.Limit).ToList();

            var result = new GetBookmarksResponse { HasMore = hasMore };
            if (!bookmarks.Any()) return result;

            // Resolve theo nhóm conversation để mỗi conversation chỉ đọc cache 1 lần.
            var byConversation = bookmarks.GroupBy(q => q.ConversationId).ToList();
            var resolved = new Dictionary<string, BookmarkItemResponse>();
            foreach (var group in byConversation)
            {
                var conversationInfo = await _conversationCache.GetConversationInfo(group.Key);
                var members = await _memberCache.GetMembers(group.Key);
                var messages = await _messageCache.GetMessages(group.Key);

                // Title hội thoại direct = tên đối phương (cache Title có thể rỗng với chat 1-1).
                var title = conversationInfo?.Title;
                if (string.IsNullOrEmpty(title) && conversationInfo is { IsGroup: false } && members is not null)
                    title = members.FirstOrDefault(q => q.Contact.Id != userId)?.Contact.Name;

                foreach (var bookmark in group)
                {
                    var message = messages?.SingleOrDefault(q => q.Id == bookmark.MessageId);
                    var sender = message is null ? null : members?.SingleOrDefault(q => q.Contact.Id == message.ContactId);
                    resolved[bookmark.Id] = new BookmarkItemResponse
                    {
                        Id = bookmark.Id,
                        ConversationId = bookmark.ConversationId,
                        ConversationTitle = title ?? string.Empty,
                        IsGroup = conversationInfo?.IsGroup ?? false,
                        MessageId = bookmark.MessageId,
                        MessageType = message?.Type ?? string.Empty,
                        Content = message is null || message.RecalledTime is not null ? string.Empty : message.Content,
                        SenderId = message?.ContactId ?? string.Empty,
                        SenderName = sender?.Contact.Name ?? string.Empty,
                        SenderAvatar = sender?.Contact.Avatar,
                        MessageCreatedTime = message?.CreatedTime,
                        BookmarkedTime = bookmark.CreatedTime,
                        IsUnavailable = message is null || message.RecalledTime is not null
                    };
                }
            }

            // Giữ đúng thứ tự phân trang (mới lưu trước) sau khi resolve theo nhóm.
            result.Bookmarks = bookmarks.Select(q => resolved[q.Id]).ToList();
            return result;
        }
    }
}

public class GetBookmarksEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Bookmark).MapGet("",
        async (ISender sender, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var result = await sender.Send(new GetBookmarks.Request(page, limit));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
