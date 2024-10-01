using System.Text.Json.Serialization;

namespace Domain.Features;

public class Contact : MongoBaseModel
{
    [JsonIgnore]
    public string Username { get; set; }
    [JsonIgnore]
    public string Password { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
    public string Bio { get; set; }
    public bool IsOnline { get; set; }
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? LastLogout { get; set; }
}