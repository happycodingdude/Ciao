using Chat.API.Repository;

namespace Chat.API.Model
{
    public class MessageDto : BaseModel
    {
        public string? Type { get; set; }
        public string? Content { get; set; }
        public string? Status { get; set; } = "received";
        public bool IsPinned { get; set; }
        public bool IsLike { get; set; }
        public int LikeCount { get; set; }
        public DateTime? SeenTime { get; set; }
        public Guid ContactId { get; set; }
        public Guid ConversationId { get; set; }
        public Contact? Contact { get; set; }
        public Conversation? Conversation { get; set; }
        public ICollection<Attachment>? Attachments { get; set; }
    }

    public class MessageNoReference : BaseModel
    {
        public string? Type { get; set; }
        public string? Content { get; set; }
        public string? Status { get; set; }
        public bool IsPinned { get; set; }
        public bool IsLike { get; set; }
        public int LikeCount { get; set; }
        public DateTime? SeenTime { get; set; }
        public Guid ContactId { get; set; }
        public Guid ConversationId { get; set; }
        // public ContactNoReference? Contact { get; set; }
        public ICollection<Attachment>? Attachments { get; set; }
    }

    public class MessageToNotify : BaseModel
    {
        public string? Type { get; set; }
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        public string? Status { get; set; }
        public bool IsPinned { get; set; }
        public bool IsLike { get; set; }
        public int LikeCount { get; set; }
        public Guid ContactId { get; set; }
        public Guid ConversationId { get; set; }
        public ICollection<AttachmentNoReference>? Attachments { get; set; }
    }
}