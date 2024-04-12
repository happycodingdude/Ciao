namespace Chat.API.Repository
{
    public class Conversation : BaseModel
    {
        public string? Title { get; set; }
        public DateTime? DeletedTime { get; set; }
        public string? Avatar { get; set; }
        public bool IsGroup { get; set; }
        public ICollection<Participant>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }
    }
}