namespace Application.DTOs;

public class GetListFriendItem
{
    public string Id { get; set; } = null!;
    public string Status { get; set; } = null!;
    public GetListFriendItem_Contact Contact { get; set; } = null!;
}

public class GetListFriendItem_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsOnline { get; set; }
    // Quan hệ bạn bè nằm ở FriendCacheModel (parent) nhưng frontend đọc trong contact
    // (friendStatus/friendId/directConversation). Populate vào đây để contact self-contained.
    public string? FriendId { get; set; }
    public string? FriendStatus { get; set; }
    public string? DirectConversation { get; set; }
}

public class FriendSuggestionItem
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsOnline { get; set; }
    // Số bạn chung giữa user hiện tại và contact được gợi ý.
    public int MutualCount { get; set; }
}

public class FriendWithStatus : MongoBaseModel
{
    public FriendDto_Contact FromContact { get; set; } = null!;
    public FriendDto_Contact ToContact { get; set; } = null!;
    public DateTime? AcceptTime { get; set; }
    public string Status { get; set; } = null!;
}