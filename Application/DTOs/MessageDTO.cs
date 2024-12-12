namespace Application.DTOs;

public class MessageToNotify : Message
{
    public string ConversationId { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
}

public class MessageWithReactions : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Status { get; set; } = null!;
    public bool IsPinned { get; set; }
    public DateTime? SeenTime { get; set; }
    public string ContactId { get; set; } = null!;
    public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string CurrentReaction { get; set; } = null!;
}