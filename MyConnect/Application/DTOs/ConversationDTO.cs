namespace Application.DTOs;

public class CreateConversationRequest
{
    public string Title { get; set; }
    public bool IsGroup { get; set; }
    public ICollection<CreateConversation_Participant> Participants { get; set; }
}

public class CreateConversation_Participant
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; }
}

public class ConversationToNotify
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
}

public class ConversationWithTotalUnseen : MongoBaseModel
{
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<Participant>? Participants { get; set; }
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; }
    public string LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; }
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
}