namespace Chat.API.Model;

public class FriendDto : BaseModel
{
    public Guid? FromContactId { get; set; }
    public Guid? ToContactId { get; set; }
    public DateTime? AcceptTime { get; set; }
    public Contact? FromContact { get; set; }
    public Contact? ToContact { get; set; }
}

public class GetAllFriend
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public string ContactName { get; set; }
}

public class FriendToNotify
{
    public Guid? RequestId { get; set; }
    public Guid? ContactId { get; set; } // Support client to refetch friend request when cancel request
}