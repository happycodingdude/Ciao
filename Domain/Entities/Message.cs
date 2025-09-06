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
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
}

public class MessageReaction
{
    public string ContactId { get; set; } = null!;
    public string Type { get; set; } = null!;
}