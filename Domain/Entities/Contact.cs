namespace Domain.Entities;

public class Contact : MongoBaseModel
{
    [JsonIgnore]
    public string Username { get; set; } = null!;
    [JsonIgnore]
    public string Password { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public bool IsOnline { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime? LastLogout { get; set; }
    [JsonIgnore]
    public string RefreshToken { get; set; } = null!;
    [JsonIgnore]
    public DateTime? ExpiryDate { get; set; }
    // Per-user preferences (privacy + notification). Trả về kèm GetInfo để FE hydrate 1 lần.
    public ContactSettings Settings { get; set; } = new();
}