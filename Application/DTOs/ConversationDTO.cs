namespace Application.DTOs;

public class CreateConversationRequest : MongoBaseModel
{
    public bool IsGroup { get; set; }
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public ICollection<CreateConversation_Participant> Participants { get; set; } = null!;
}

public class CreateConversation_Participant
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
}

public class ConversationToNotify : CreateConversationRequest
{

}

public class ConversationWithTotalUnseen : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<ParticipantWithFriendRequest> Participants { get; set; } = null!;
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
}

public class ConversationWithNextPage : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
    [JsonIgnore]
    public List<Message> NextPage { get; set; } = new List<Message>();
    public bool NextExist { get; set; }
}

public class ConversationWithMessages : ConversationWithNextPage
{
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
}

public class ConversationWithMessagesAndFriendRequest : ConversationWithNextPage
{
    public ICollection<ParticipantWithFriendRequest> Participants { get; set; } = new List<ParticipantWithFriendRequest>();
}