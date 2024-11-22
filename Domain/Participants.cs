namespace Domain.Features;

public class Participant : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    // public Guid ConversationId { get; set; }
    // public string ContactId { get; set; }
    // public Conversation? Conversation { get; set; }
    public Participant_Contact Contact { get; set; }
}

public class Participant_Contact
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
    public bool IsOnline { get; set; }
}