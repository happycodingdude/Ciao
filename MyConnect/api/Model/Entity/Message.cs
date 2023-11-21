namespace MyConnect.Model
{
    public class Message : BaseModel
    {
        public string? Type { get; set; }
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        public string? Status { get; set; } = "received";
        public bool IsPinned { get; set; }
        public bool IsLike { get; set; }
        public int LikeCount { get; set; }
        public Guid ContactId { get; set; }
        public Guid ConversationId { get; set; }
        public Contact? Contact { get; set; }
        public Conversation? Conversation { get; set; }
    }

    public class MessageGroupByCreatedTime
    {
        public string? Date { get; set; }
        public List<Message>? Messages { get; set; }
    }
}