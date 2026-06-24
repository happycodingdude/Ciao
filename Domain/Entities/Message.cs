namespace Domain.Entities;

public class Message : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string PinnedBy { get; set; } = null!;
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();

    // @mention (Option B — có cấu trúc): danh sách userId được tag, sentinel "all" cho @All.
    // Lưu userId (không phải tên) để tạo notification chính xác, tránh báo nhầm khi trùng tên.
    // Doc Mongo cũ thiếu field → default rỗng (no migration).
    public List<string> Mentions { get; set; } = new List<string>();

    // Tính năng 2: edit / recall.
    // Đều dùng soft-flag (timestamp) thay vì hard-delete để giữ reply chain, audit và search consistency.
    public DateTime? EditedTime { get; set; }            // null = chưa từng edit
    public DateTime? RecalledTime { get; set; }          // null = chưa recall (thay cho cờ IsRecalled)
    public string? RecalledByContactId { get; set; }     // sender hoặc moderator thực hiện thu hồi (audit)
}

public class MessageReaction
{
    public string ContactId { get; set; } = null!;
    public string Type { get; set; } = null!;
}