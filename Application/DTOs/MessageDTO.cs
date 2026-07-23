namespace Application.DTOs;

public class SendMessageReq
{
    // Nguồn validate chính là FluentValidation (SendMessage.Validator). RegularExpression
    // ở đây chỉ là hàng rào phụ — giữ đồng bộ với danh sách type được hỗ trợ.
    [Required]
    [RegularExpression("^(text|media|sticker|gif|poll|contact)$", ErrorMessage = "Unsupported message type.")]
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public List<SendMessageReq_Attachment> Attachments { get; set; } = new();
    // @mention userIds từ FE (sentinel "all" cho @All). Default rỗng → tin không tag không đổi.
    public List<string> Mentions { get; set; } = new();
    // Chia sẻ danh bạ (Type = contact): thẻ liên hệ đính kèm. Content = tên để preview.
    public SharedContact? SharedContact { get; set; }
    // Bình chọn (Type = poll): Content = câu hỏi để preview.
    public Poll? Poll { get; set; }
}

public class SendMessageReq_Attachment
{
    public string Type { get; set; } = null!;
    public string MediaName { get; set; } = null!;
    public double MediaSize { get; set; }
    public string MediaUrl { get; set; } = null!;
}

public class SendMessageRes
{
    public string MessageId { get; set; } = null!;
    public string[] Attachments { get; set; } = null!;
}

public class TranslateMessageReq
{
    [Required]
    public string Text { get; set; } = null!;
    // Ngôn ngữ đích (mặc định "vi" nếu bỏ trống).
    public string? TargetLang { get; set; }
}

public class TranslateMessageRes
{
    public string TranslatedText { get; set; } = null!;
    public string? DetectedSourceLang { get; set; }
}

public class MessageReactionSummary : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    // Pin đã tách sang collection PinnedMessage (dùng chung, per-conversation) — không còn nhúng
    // trên message. FE lấy trạng thái ghim của tin qua endpoint pinned/ids riêng.
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public List<Attachment> Attachments { get; set; } = new();
    // Loại tin giàu nội dung: phải có trong DTO đọc, nếu không sẽ mất khi cache/fetch (reload biến mất).
    public SharedContact? SharedContact { get; set; }
    public Poll? Poll { get; set; }
    // Preview Link: phải có trong DTO đọc để reload/đăng nhập lại vẫn hiển thị thẻ (đã persist Mongo).
    public LinkPreview? LinkPreview { get; set; }
    // Nhiều link → nhiều thẻ (giữ thứ tự). LinkPreview (singular) = phần tử đầu, giữ cho backward-compat.
    public List<LinkPreview> LinkPreviews { get; set; } = new();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string? CurrentReaction { get; set; }

    // Tính năng 2: phản chiếu trạng thái edit/recall xuống cache + FE.
    public DateTime? EditedTime { get; set; }
    public DateTime? RecalledTime { get; set; }
    public string? RecalledByContactId { get; set; }
}

public class MessageWithReactions : MessageReactionSummary
{
    public List<MessageReaction> Reactions { get; set; } = new();
}

public class MessagesWithHasMore
{
    public bool HasMore { get; set; }
    public List<MessageReactionSummary> Messages { get; set; } = new();
}

public class MessageSearchResult : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
}

// Một mục trong panel "Tin đã ghim" của hội thoại. Nội dung resolve LIVE từ message cache lúc đọc
// (không snapshot) để phản ánh edit/recall mới nhất; Content đã build thành chuỗi preview theo loại
// tin (BuildLastMessagePreview) để FE render trực tiếp. Đồng nhất với BookmarkItemResponse.
public class PinnedMessageItem
{
    public string Id { get; set; } = null!;              // pinnedMessage id
    public string MessageId { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;       // người gửi tin (FE resolve tên/avatar)
    public string? PinnedBy { get; set; }                // người ghim (tooltip)
    public DateTime? MessageCreatedTime { get; set; }
    public DateTime PinnedTime { get; set; }
    public bool IsUnavailable { get; set; }              // tin gốc đã recall hoặc không còn trong cache
}

// Response phân trang panel "Tin đã ghim" — cùng shape với GetBookmarksResponse (HasMore + list).
public class GetPinnedMessagesResponse
{
    public bool HasMore { get; set; }
    public List<PinnedMessageItem> Items { get; set; } = new();
}

// messageId + người ghim của các tin đã ghim trong 1 hội thoại — FE dùng để hiển thị badge
// "đã ghim" + tooltip trên từng tin mà không cần tải toàn bộ danh sách. Đối xứng bookmark ids.
public class PinnedIdItem
{
    public string MessageId { get; set; } = null!;
    public string? PinnedBy { get; set; }
}

public class SystemMessage
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;

    public SystemMessage(string content)
    {
        Type = "system";
        Content = content;
        ContactId = "system";
    }
}