namespace Application.DTOs;

public class ContactDto : MongoBaseModel
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public bool IsOnline { get; set; }
    public DateTime? LastLogout { get; set; }
    public string FriendId { get; set; } = null!;
    public string FriendStatus { get; set; } = null!;
}

[BsonIgnoreExtraElements]
public class ContactInfo
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public bool IsOnline { get; set; }
}