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

public class GetDirectConversationIdRes
{
    // Id hội thoại trực tiếp đã tồn tại giữa 2 người, hoặc null nếu chưa có.
    // FE dùng để tránh quét toàn bộ danh sách chat phân trang khi xác định "đã có chưa".
    public string? ConversationId { get; set; }
}

public class ConversationWithTotalUnseenWithContactInfo : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    // Phase 3 — theme chat chung cho cả hội thoại (key preset, null = mặc định).
    public string? Wallpaper { get; set; }
    public string? BubbleColor { get; set; }
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
    // Phase 3 — theme chat chung cho cả hội thoại (key preset, null = mặc định).
    public string? Wallpaper { get; set; }
    public string? BubbleColor { get; set; }
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