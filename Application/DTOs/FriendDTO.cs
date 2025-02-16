namespace Application.DTOs;

public class GetListFriendItem
{
    public string Id { get; set; } = null!;
    public GetListFriendItem_Contact Contact { get; set; } = null!;
}

public class GetListFriendItem_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
}

public class FriendWithStatus : MongoBaseModel
{
    public FriendDto_Contact FromContact { get; set; } = null!;
    public FriendDto_Contact ToContact { get; set; } = null!;
    public DateTime? AcceptTime { get; set; }
    public string Status { get; set; } = null!;
}