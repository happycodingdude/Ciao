namespace Application.DTOs;

public class MessageDto : BaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; } = "received";
    public bool IsPinned { get; set; }
    public bool IsLike { get; set; }
    public int LikeCount { get; set; }
    public DateTime? SeenTime { get; set; }
    public Guid ContactId { get; set; }
    public Guid ConversationId { get; set; }
    public Contact? Contact { get; set; }
    public Conversation? Conversation { get; set; }
    public ICollection<Attachment>? Attachments { get; set; }
}

public class MessageNoReference : BaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; }
    public bool IsPinned { get; set; }
    public bool IsLike { get; set; }
    public int LikeCount { get; set; }
    public DateTime? SeenTime { get; set; }
    public Guid ContactId { get; set; }
    public Guid ConversationId { get; set; }
    // public ContactNoReference? Contact { get; set; }
    public ICollection<Attachment>? Attachments { get; set; }
}

public class MessageToNotify : BaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string MediaUrl { get; set; }
    public string Status { get; set; }
    public bool IsPinned { get; set; }
    public bool IsLike { get; set; }
    public int LikeCount { get; set; }
    public Guid ContactId { get; set; }
    public Guid ConversationId { get; set; }
    public ICollection<AttachmentNoReference>? Attachments { get; set; }
}

public class CreateMessageRequest : Message
{
    public string ConversationId { get; set; }
    public string Moderator { get; set; }
}

// public class MessageWithAttachment : Message
// {
//     // public Guid ContactId { get; set; }
//     // public Guid ConversationId { get; set; }
//     public MessageWithAttachment_Contact Contact { get; set; }
//     // public Conversation? Conversation { get; set; }
//     public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
// }

// public class MessageWithAttachment_Contact
// {
//     public string Id { get; set; }
//     public string Name { get; set; }
//     public string Avatar { get; set; }
// }

// public class MessageWithAttachment_Attachment
// {
//     public string Id { get; set; }
//     public string Type { get; set; }
//     public string MediaName { get; set; }
//     public double? MediaSize { get; set; }
//     public string MediaUrl { get; set; }
// }