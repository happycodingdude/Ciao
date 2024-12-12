namespace Domain.Entities;

public class Conversation : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}