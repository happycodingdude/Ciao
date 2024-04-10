using MyConnect.Repository;

namespace MyConnect.Model
{
    public class AttachmentDto : BaseModel
    {
        public string? Type { get; set; }
        public string? MediaName { get; set; }
        public double? MediaSize { get; set; }
        public string? MediaUrl { get; set; }
        public Guid MessageId { get; set; }
        public Message? Message { get; set; }
    }

    public class AttachmentNoReference : BaseModel
    {
        public string? Type { get; set; }
        public string? MediaName { get; set; }
        public double? MediaSize { get; set; }
        public string? MediaUrl { get; set; }
        public Guid MessageId { get; set; }
    }

    public class AttachmentGroupByCreatedTime
    {
        public string? Date { get; set; }
        public List<Attachment>? Attachments { get; set; }
    }
}