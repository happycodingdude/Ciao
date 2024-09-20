namespace Domain.Features;

public class Message : MongoBaseModel
{
    public string Type { get; set; }
    public string Content { get; set; }
    public string Status { get; set; } = "received";
    public bool IsPinned { get; set; }
    public bool IsLike { get; set; }
    public int LikeCount { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? SeenTime { get; set; }
    // public Guid ContactId { get; set; }
    // public string ConversationId { get; set; }
    public Message_Contact Contact { get; set; }
    // public Conversation? Conversation { get; set; }
    public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
}

public class Message_Contact
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
}