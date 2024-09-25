namespace Application.DTOs;

public class NotificationDto : MongoBaseModel
{
    public Guid SourceId { get; set; }
    public string SourceType { get; set; }
    public string Content { get; set; }
    public bool Read { get; set; }
    public Guid ContactId { get; set; }
    public Contact? Contact { get; set; }
}

// public class NotificationWithSourceData : Notification
// {
//     public object SourceData { get; set; }
// }

public class NotificationToNotify
{
    public Guid Id { get; set; }
    public Guid SourceId { get; set; }
    public string SourceType { get; set; }
    public string Content { get; set; }
    public bool Read { get; set; }
    public Guid ContactId { get; set; }
}