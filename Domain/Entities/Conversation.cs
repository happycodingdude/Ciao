namespace Domain.Entities;

public class Conversation : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public DateTime? DeletedTime { get; set; }
    public List<Member> Members { get; set; } = new List<Member>();
    public List<Message> Messages { get; set; } = new List<Message>();
}