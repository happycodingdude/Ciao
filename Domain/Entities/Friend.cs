namespace Domain.Entities;

public class Friend : MongoBaseModel
{
    public FriendDto_Contact FromContact { get; set; } = null!;
    public FriendDto_Contact ToContact { get; set; } = null!;
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? AcceptTime { get; set; }
}

public class FriendDto_Contact
{
    public string ContactId { get; set; } = null!;
    public string ContactName { get; set; } = null!;
}