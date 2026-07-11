namespace Domain.Entities;

public class Member : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }

    // Phase 3 — cá nhân hóa hội thoại. Doc Mongo cũ thiếu field → default null (no migration).
    // PinnedTime: thời điểm user ghim hội thoại này (null = không ghim). Per-user vì Member là 1 row/user/conversation.
    public DateTime? PinnedTime { get; set; }
    // Nickname: biệt danh của THÀNH VIÊN NÀY trong hội thoại, mọi thành viên đều thấy (kiểu Messenger).
    public string? Nickname { get; set; }
    // Wallpaper/BubbleColor từng nằm ở đây (per-user) — đã CHUYỂN lên Conversation (theme chung
    // cho cả hội thoại). Doc Mongo cũ còn field trên Member sẽ bị bỏ qua nhờ IgnoreExtraElementsConvention.
    public string? LastDeliveredMessageId { get; set; }
    public DateTime? LastDeliveredTime { get; set; }
}