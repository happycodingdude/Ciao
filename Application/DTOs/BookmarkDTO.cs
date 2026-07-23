namespace Application.DTOs;

// Một mục trong danh sách "Tin nhắn đã lưu". Nội dung tin resolve LIVE lúc đọc
// (không snapshot) để phản ánh edit/recall mới nhất; tin bị thu hồi/mất → IsUnavailable.
public class BookmarkItemResponse
{
    public string Id { get; set; } = null!;              // bookmark id
    public string ConversationId { get; set; } = null!;
    public string ConversationTitle { get; set; } = null!;
    public bool IsGroup { get; set; }
    public string MessageId { get; set; } = null!;
    public string MessageType { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string SenderId { get; set; } = null!;
    public string SenderName { get; set; } = null!;
    public string? SenderAvatar { get; set; }
    public DateTime? MessageCreatedTime { get; set; }
    public DateTime BookmarkedTime { get; set; }
    public bool IsUnavailable { get; set; }              // tin gốc đã recall hoặc không còn tồn tại
}

public class GetBookmarksResponse
{
    public bool HasMore { get; set; }
    public List<BookmarkItemResponse> Bookmarks { get; set; } = new();
}

// Một liên kết trong tab "Liên kết" (Media) của hội thoại.
public class ConversationLinkItem
{
    public string MessageId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public DateTime CreatedTime { get; set; }
    public string Url { get; set; } = null!;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? SiteName { get; set; }
}

public class GetConversationLinksResponse
{
    // KHÔNG phân trang: luôn trả tất cả link của hội thoại (xem GetConversationLinks).
    public List<ConversationLinkItem> Links { get; set; } = new();
}
