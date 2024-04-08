using MyConnect.Repository;

namespace MyConnect.Model
{
    public class NotificationDto : BaseModel
    {
        public Guid SourceId { get; set; }
        public string SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
        public Contact? Contact { get; set; }
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

    public class RegisterConnection
    {
        public Guid Id { get; set; }
        public string? Token { get; set; }
    }

    public class CustomNotification<T> where T : class
    {
        public string @event { get; set; }
        public object data { get; set; }

        public CustomNotification(string @event, T data)
        {
            this.@event = @event;
            this.data = data;
        }
    }
}