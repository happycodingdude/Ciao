namespace Application.DTOs;

public class ConversationDto : BaseModel
{
    // [JsonPropertyName("title")]
    public string? Title { get; set; }
    public DateTime? DeletedTime { get; set; }
    public string? Avatar { get; set; }
    public bool IsGroup { get; set; }
    public ICollection<ParticipantNoReference>? Participants { get; set; }
    // public ICollection<Message>? Messages { get; set; }
}

public class ConversationToNotify
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
}