namespace Domain.Features;

public class Message : MongoBaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; } = "received";
    public bool IsPinned { get; set; }
    // public bool IsReact { get; set; }
    // public int ReactionCount { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? SeenTime { get; set; }
    public string ContactId { get; set; }
    public List<MessageReaction> Reactions { get; set; }
    // public string ConversationId { get; set; }
    // public Message_Contact Contact { get; set; }
    // public Conversation? Conversation { get; set; }
    public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
}

// public class MessageReaction
// {
//     public string ContactId { get; set; }
//     public bool IsLike { get; set; }
//     public bool IsLove { get; set; }
//     public bool IsCare { get; set; }
//     public bool IsWow { get; set; }
//     public bool IsSad { get; set; }
//     public bool IsAngry { get; set; }
//     public string CurrentReaction { get; set; }
// }

public class MessageReaction
{
    public string ContactId { get; set; }
    public string Type { get; set; }
}