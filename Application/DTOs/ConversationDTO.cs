namespace Application.DTOs;

public class CreateGroupConversationRequest : MongoBaseModel
{
    public bool IsGroup { get; set; }
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public List<CreateGroupConversation_Participant> Participants { get; set; } = null!;
}

public class CreateGroupConversation_Participant
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
}

public class ConversationToNotify
{
    public string Id { get; set; } = null!;
    public bool IsGroup { get; set; }
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public string LastMessageContact { get; set; } = null!;
    public List<Participant> Participants { get; set; } = null!;
}

public class ConversationWithTotalUnseen : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public List<ParticipantWithFriendRequest> Participants { get; set; } = null!;
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
    public List<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
}