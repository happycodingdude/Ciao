namespace Application.WebSocketEvents;

public class EventNewMessage
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string? Content { get; set; }
    public bool IsForwarded { get; set; }
    public DateTime CreatedTime { get; set; }
    public EventNewMessage_Conversation Conversation { get; set; } = null!;
    public EventNewConversation_Member[] Members { get; set; } = null!;
    public EventNewMessage_Contact Contact { get; set; } = null!;
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
}

public class EventNewMessage_Conversation
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public string LastMessage { get; set; } = null!;
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    // public List<MemberWithContactInfoAndFriendRequest> Members { get; set; } = null!;
}

public class EventNewMessage_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
}

public class EventNewConversation
{
    public EventNewMessage_Conversation Conversation { get; set; } = null!;
    public EventNewConversation_Member[] Members { get; set; } = null!;
    public Message? Message { get; set; }
}

public class EventNewConversation_Member
{
    public string Id { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public ContactInfoMoreDetails Contact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsSelected { get; set; }
    public bool IsNew { get; set; }
}

public class EventNewFriendRequest
{
    public string FriendId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
}