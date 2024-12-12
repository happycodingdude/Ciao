namespace Domain.Entities;

public class Message : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Status { get; set; } = "received";
    public bool IsPinned { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? SeenTime { get; set; }
    public string ContactId { get; set; } = null!;
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
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
    public string ContactId { get; set; } = null!;
    public string Type { get; set; } = null!;
}