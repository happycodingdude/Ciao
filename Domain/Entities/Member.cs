namespace Domain.Entities;

public class Member : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public string? LastDeliveredMessageId { get; set; }
    public DateTime? LastDeliveredTime { get; set; }
}