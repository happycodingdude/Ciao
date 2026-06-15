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

    // Tính năng 2: edit / delete-for-me / recall.
    // Đều dùng soft-flag (timestamp/list) thay vì hard-delete để giữ reply chain, audit và search consistency.
    public DateTime? EditedTime { get; set; }                        // null = chưa từng edit
    public DateTime? RecalledTime { get; set; }                      // null = chưa recall (thay cho cờ IsRecalled)
    public string? RecalledByContactId { get; set; }                 // sender hoặc moderator thực hiện thu hồi (audit)
    public List<string> DeletedForContactIds { get; set; } = new();  // delete-for-me horizon (per-user, $addToSet)
}

public class MessageReaction
{
    public string ContactId { get; set; } = null!;
    public string Type { get; set; } = null!;
}