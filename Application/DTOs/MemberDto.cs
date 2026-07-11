namespace Application.DTOs;

public class MemberDto : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
}

public class MemberWithFriendRequest : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
    public string FriendId { get; set; } = null!;
    public string FriendStatus { get; set; } = null!;
}

[BsonIgnoreExtraElements]
public class MemberWithContactInfo : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public ContactInfoMoreDetails Contact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public string? LastDeliveredMessageId { get; set; }
    public DateTime? LastDeliveredTime { get; set; }
    public bool IsSelected { get; set; }

    // Phase 3 — cá nhân hóa hội thoại (per-user trên Member, xem Domain.Entities.Member).
    // Wallpaper/BubbleColor đã chuyển lên conversation-level (theme chung).
    public DateTime? PinnedTime { get; set; }
    public string? Nickname { get; set; }
}

[BsonIgnoreExtraElements]
public class MemberWithContactInfoAndFriendRequest : MemberWithContactInfo
{
    public string? FriendId { get; set; }
    public string FriendStatus { get; set; } = null!;
    public string? DirectConversation { get; set; }
}