namespace Domain.Entities;

// Embedded 1-1 trên Contact (không tách collection để tránh round-trip thừa).
// Doc Mongo cũ thiếu field → property initializer giữ default (driver không reset field vắng),
// nên KHÔNG cần migration và mọi flag mặc định "bật" (an toàn nhất).
[BsonIgnoreExtraElements]
public class ContactSettings
{
    // Privacy — enforce ở BE (mask presence của người được xem), không chỉ ẩn FE.
    public bool ShowOnlineStatus { get; set; } = true;
    public bool ShowLastSeen { get; set; } = true;

    // Notification preferences (per-type).
    public bool PushEnabled { get; set; } = true;
    public bool NotifyOnMessage { get; set; } = true;
    public bool NotifyOnFriendRequest { get; set; } = true;
    public bool NotifyOnReaction { get; set; } = true;
    public bool SoundEnabled { get; set; } = true;
}
