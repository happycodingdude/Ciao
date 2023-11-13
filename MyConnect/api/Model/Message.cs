namespace MyConnect.Model
{
    public class Message : BaseModel
    {
        public string? Type { get; set; }
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        public string? Status { get; set; }
        public bool IsPinned { get; set; }
        public bool IsLike { get; set; }
        public bool LikeCount { get; set; }
        public Guid ContactId { get; set; }
        public Contact? Contact { get; set; }
    }
}