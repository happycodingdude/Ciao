namespace Application.DTOs;

public class ParticipantDto : BaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Guid ConversationId { get; set; }
    public Guid ContactId { get; set; }
    public Conversation? Conversation { get; set; }
    public Contact? Contact { get; set; }
}

public class ParticipantNoReference : BaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Guid ConversationId { get; set; }
    public Guid ContactId { get; set; }
    public ContactNoReference? Contact { get; set; }
}

public class ParticipantWithFriendRequest : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Participant_Contact Contact { get; set; }
    public string FriendId { get; set; }
    public string FriendStatus { get; set; }
}