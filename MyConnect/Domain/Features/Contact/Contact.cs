namespace Domain.Features;

public class Contact : BaseModel
{
    public string? Name { get; set; }
    // public string? Username { get; set; }
    // public string? Password { get; set; }
    public string? Avatar { get; set; }
    public string? Bio { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastLogout { get; set; }
    public ICollection<ScheduleContact>? ScheduleContacts { get; set; }
    public ICollection<Participant>? Participants { get; set; }
    public ICollection<Message>? Messages { get; set; }
    // public ICollection<Friend>? Friends { get; set; }
}