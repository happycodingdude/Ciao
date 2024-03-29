namespace MyConnect.Model
{
    public class Notification : BaseModel
    {
        public Guid SourceId { get; set; }
        public string SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
        public Contact? Contact { get; set; }
    }

    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid SourceId { get; set; }
        public object SourceData { get; set; }
        public object SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
    }

    public class NotificationTypeConstraint<T> where T : class
    {
        public Guid Id { get; set; }
        public Guid SourceId { get; set; }
        public T SourceData { get; set; }
        public object SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
    }
}