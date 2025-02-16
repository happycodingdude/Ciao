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
}

[BsonIgnoreExtraElements]
public class MemberWithContactInfoAndFriendRequest : MemberWithContactInfo
{
    public string? FriendId { get; set; }
    public string FriendStatus { get; set; } = null!;
}