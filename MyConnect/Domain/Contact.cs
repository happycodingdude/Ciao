namespace Domain.Features;

public class Contact : MongoBaseModel
{
    public string UserId { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
    public string Bio { get; set; }
    public bool IsOnline { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? LastLogout { get; set; }
}