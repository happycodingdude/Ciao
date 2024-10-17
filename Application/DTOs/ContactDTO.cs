namespace Application.DTOs;

public class ContactDto : Contact
{
    public string FriendId { get; set; }
    public string FriendStatus { get; set; }
}

public class ContactNoReference : BaseModel
{
    public string? Name { get; set; }
    [Newtonsoft.Json.JsonIgnore]
    public string? Username { get; set; }
    [Newtonsoft.Json.JsonIgnore]
    public string? Password { get; set; }
    public string? Avatar { get; set; }
    public bool IsOnline { get; set; }
    [Newtonsoft.Json.JsonIgnore]
    public DateTime? LastLogout { get; set; }
}