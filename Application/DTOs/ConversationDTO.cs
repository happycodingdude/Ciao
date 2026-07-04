namespace Application.DTOs;

public class CreateGroupConversationReq
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string[] Members { get; set; } = null!;
}

public class CreateDirectConversationReq
{
    public string? Message { get; set; }
    public bool IsForwarded { get; set; }
}

public class CreateDirectConversationRes
{
    public string ConversationId { get; set; } = null!;
    public string? MessageId { get; set; }
    // Cho FE biết ConversationId là hội thoại MỚI hay hội thoại cũ đã tồn tại
    // (hội thoại cũ có thể chưa được load trong danh sách chat phân trang phía client).
    public bool IsNewConversation { get; set; }
}

public class ConversationWithTotalUnseenWithContactInfo : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    // public DateTime? DeletedTime { get; set; }
    public List<MemberWithContactInfo> Members { get; set; } = null!;
    // public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    public bool HasAttachment { get; set; }
    // public DateTime? LastSeenTime { get; set; }
    // public bool IsNotifying { get; set; }
    public List<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
}

public class ConversationWithTotalUnseenWithContactInfoAndNoMessage : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    // public DateTime? DeletedTime { get; set; }
    public List<MemberWithContactInfoAndFriendRequest> Members { get; set; } = null!;
    // public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    // public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
    public bool HasAttachment { get; set; }
}

public class GetConversationsResponse : ConversationWithTotalUnseenWithContactInfoAndNoMessage
{
    public bool UnSeen { get; set; }
}