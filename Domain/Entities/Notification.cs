namespace Domain.Entities;

public class Notification : MongoBaseModel
{
    public string Content { get; set; } = null!;
    public bool Read { get; set; }
    public string ContactId { get; set; } = null!;
    public string SourceId { get; set; } = null!;
    public string SourceType { get; set; } = null!;

    // Bóc tách content thành phần để UI kiểu Teams (avatar + tên đậm + action + preview).
    // Default rỗng → backward-compatible với bản ghi cũ (FE fallback về Content/icon).
    public string ActorName { get; set; } = "";
    public string ActorAvatar { get; set; } = "";
    public string Action { get; set; } = "";   // "reacted to your message", "mentioned you"...
    public string Preview { get; set; } = "";  // snippet tin nhắn / tên group
    public string SourceMessageId { get; set; } = ""; // tin nhắn gốc → FE highlight trong pane review
}