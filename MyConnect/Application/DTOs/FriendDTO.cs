namespace Application.DTOs;

// public class FriendDto : MongoBaseModel
// {
//     public FriendDto_Contact FromContact { get; set; }
//     public FriendDto_Contact ToContact { get; set; }
//     public DateTime? AcceptTime { get; set; }
// }

// public class FriendDto_Contact
// {
//     public string ContactId { get; set; }
//     public string ContactName { get; set; }
// }

public class GetAllFriend
{
    public string Id { get; set; }
    public string ContactId { get; set; }
    public string ContactName { get; set; }
    public string Status { get; set; }
}

public class FriendToNotify
{
    public string RequestId { get; set; }
    public Guid? ContactId { get; set; } // Support client to refetch friend request when cancel request
}