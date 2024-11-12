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

public class GetConversationsWithUnseenMesagesResponse
{
    public List<ConversationWithTotalUnseen> Conversations { get; set; } = new List<ConversationWithTotalUnseen>();

    public GetConversationsWithUnseenMesagesResponse() { }

    public GetConversationsWithUnseenMesagesResponse(List<ConversationWithTotalUnseen> conversations)
    {
        Conversations = conversations;
    }
}

public class ConversationWithTotalUnseen : MongoBaseModel
{
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<ParticipantWithFriendRequest>? Participants { get; set; }
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; }
    public string LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; }
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
}

public class ConversationWithNextPage : MongoBaseModel
{
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    [JsonIgnore]
    public List<Message> NextPage { get; set; } = new List<Message>();
    public bool NextExist { get; set; }
}

public class ConversationWithMessages : ConversationWithNextPage
{
    public ICollection<Participant>? Participants { get; set; } = new List<Participant>();
}

public class ConversationWithMessagesAndFriendRequest : ConversationWithNextPage
{
    public ICollection<ParticipantWithFriendRequest>? Participants { get; set; } = new List<ParticipantWithFriendRequest>();
}