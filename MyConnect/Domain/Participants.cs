namespace Domain.Features;

public class Participant : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    // public Guid ConversationId { get; set; }
    // public string ContactId { get; set; }
    // public Conversation? Conversation { get; set; }
    public Contact Contact { get; set; }
}