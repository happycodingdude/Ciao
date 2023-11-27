namespace MyConnect.Model
{
    public class Conversation : BaseModel
    {
        public string? Title { get; set; }
        public DateTime? DeletedTime { get; set; }
        public ICollection<Participants>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }
    }

    public class ConversationWithTotalUnseen : BaseModel
    {
        public string? Title { get; set; }
        public DateTime? DeletedTime { get; set; }
        public int UnSeenMessages { get; set; }
        public string? LastMessage { get; set; }
        public DateTime? LastMessageTime { get; set; }
    }
}