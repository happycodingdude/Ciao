namespace Domain.Features;

public class Friend : MongoBaseModel
{
    public FriendDto_Contact FromContact { get; set; }
    public FriendDto_Contact ToContact { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? AcceptTime { get; set; }
}

public class FriendDto_Contact
{
    public string ContactId { get; set; }
    public string ContactName { get; set; }
}