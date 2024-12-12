namespace Application.DTOs;

public class NotificationDto : MongoBaseModel
{
    public string SourceId { get; set; } = null!;
    public string SourceType { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool Read { get; set; }
    public string ContactId { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
}

public class NotificationSourceDataType_Friend
{
    public Guid FriendId { get; set; }
    public string FriendStatus { get; set; } = null!;
}