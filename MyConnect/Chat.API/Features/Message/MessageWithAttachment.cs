namespace Chat.API.Features;

public class MessageWithAttachment : BaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; }
    public bool IsPinned { get; set; }
    public bool IsLike { get; set; }
    public int LikeCount { get; set; }
    public DateTime? SeenTime { get; set; }
    public DateTime? CreatedTime { get; set; }
    public Guid ContactId { get; set; }
    public Guid ConversationId { get; set; }
    public ICollection<MessageWithAttachment_Attachment>? Attachments { get; set; }
}

public class MessageWithAttachment_Attachment
{
    public Guid? Id { get; set; }
    public string Type { get; set; }
    public string MediaName { get; set; }
    public double? MediaSize { get; set; }
    public string MediaUrl { get; set; }
}