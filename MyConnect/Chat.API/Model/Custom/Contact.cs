namespace Chat.API.Model;

public class ContactDto : BaseModel
{
    [Required]
    public string? Name { get; set; }
    [JsonIgnore]
    [Required]
    public string? Username { get; set; }
    [MinLength(6)]
    [JsonIgnore]
    public string? Password { get; set; }
    public string? Avatar { get; set; }
    public string? Bio { get; set; }
    public bool IsOnline { get; set; }
    [JsonIgnore]
    public DateTime? LastLogout { get; set; }
    public ICollection<ScheduleContact>? ScheduleContacts { get; set; }
    public ICollection<Participant>? Participants { get; set; }
    public ICollection<Message>? Messages { get; set; }
    // public ICollection<Friend>? Friends { get; set; }
    public Guid FriendId { get; set; }
    public string FriendStatus { get; set; }
}

public class ContactNoReference : BaseModel
{
    public string? Name { get; set; }
    [JsonIgnore]
    public string? Username { get; set; }
    [JsonIgnore]
    public string? Password { get; set; }
    public string? Avatar { get; set; }
    public bool IsOnline { get; set; }
    [JsonIgnore]
    public DateTime? LastLogout { get; set; }
}