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
    [BsonSerializer(typeof(NullableLocalDateTimeSerializer))]
    public DateTime? LastLogout { get; set; }
    [JsonIgnore]
    public string RefreshToken { get; set; } = null!;
    [BsonSerializer(typeof(NullableLocalDateTimeSerializer))]
    [JsonIgnore]
    public DateTime? ExpiryDate { get; set; }
}