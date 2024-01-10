namespace MyConnect.Model
{
    public class Conversation : BaseModel
    {
        public string? Title { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DeletedTime { get; set; }
        public ICollection<Participant>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }
    }

    public class ConversationNoReference : BaseModel
    {
        public string? Title { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DeletedTime { get; set; }
    }

    public class ConversationWithTotalUnseen : BaseModel
    {
        public string? Title { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DeletedTime { get; set; }
        public int UnSeenMessages { get; set; }
        public Guid LastMessageId { get; set; }
        public string? LastMessage { get; set; }
        public DateTime? LastMessageTime { get; set; }
        public Guid? LastMessageContact { get; set; }
        public DateTime? LastSeenTime { get; set; }
        public bool IsNotifying { get; set; }
    }
}