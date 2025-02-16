namespace Application.DTOs;

public class CreateGroupConversationReq
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public List<Member> Members { get; set; } = null!;
}

public class CreateDirectConversationRes
{
    public string ConversationId { get; set; } = null!;
    public string? MessageId { get; set; }
}

public class ConversationToNotify
{
    public string Id { get; set; } = null!;
    public bool IsGroup { get; set; }
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public string LastMessageContact { get; set; } = null!;
    public List<Member> Members { get; set; } = null!;
}

// public class ConversationWithTotalUnseen : MongoBaseModel
// {
//     public string Title { get; set; } = null!;
//     public string Avatar { get; set; } = null!;
//     public bool IsGroup { get; set; }
//     public DateTime? DeletedTime { get; set; }
//     public List<MemberWithFriendRequest> Members { get; set; } = null!;
//     public int UnSeenMessages { get; set; }
//     public string LastMessageId { get; set; } = null!;
//     public string LastMessage { get; set; } = null!;
//     public DateTime? LastMessageTime { get; set; }
//     public string LastMessageContact { get; set; } = null!;
//     public DateTime? LastSeenTime { get; set; }
//     public bool IsNotifying { get; set; }
//     public List<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
// }

public class ConversationWithTotalUnseenWithContactInfo : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public List<MemberWithContactInfo> Members { get; set; } = null!;
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
    public List<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
}

public class ConversationWithTotalUnseenWithContactInfoAndNoMessage : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public List<MemberWithContactInfoAndFriendRequest> Members { get; set; } = null!;
    public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
}