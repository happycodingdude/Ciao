using System.ComponentModel.DataAnnotations;

namespace MyConnect.Model
{
    public class Notification : BaseModel
    {
        [Required]
        public string SourceType { get; set; }
        [Required]
        public string Content { get; set; }
        public bool Read { get; set; }
        [Required]
        public Guid ContactId { get; set; }
        public Contact? Contact { get; set; }
    }

    public class NotificationToNotify
    {
        public string SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
    }
}