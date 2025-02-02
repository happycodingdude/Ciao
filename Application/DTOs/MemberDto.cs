namespace Application.DTOs;

public class MemberDto : BaseModel
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
public class MemberWithFriendRequestAndContactInfo : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public ContactInfo Contact { get; set; } = null!;
    public string FriendId { get; set; } = null!;
    public string FriendStatus { get; set; } = null!;
}