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

public class MessageToNotify : Message
{
    public string ConversationId { get; set; }
    public Contact Contact { get; set; }
}

public class CreateMessageRequest : Message
{
    public string ConversationId { get; set; }
    // public string Moderator { get; set; }
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


public class MessageWithReactions : MongoBaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; }
    public bool IsPinned { get; set; }
    public DateTime? SeenTime { get; set; }
    public string ContactId { get; set; }
    public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string CurrentReaction { get; set; }
}

public class ReactMessageRequest
{
    public string CurrentReaction { get; set; }
    public bool? IsLove { get; set; }
    public bool? IsCare { get; set; }
    public bool? IsLike { get; set; }
    public bool? IsWow { get; set; }
    public bool? IsSad { get; set; }
    public bool? IsAngry { get; set; }
}