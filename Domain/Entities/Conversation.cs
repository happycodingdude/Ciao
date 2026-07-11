namespace Domain.Entities;

public class Conversation : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    // Phase 3 — Đợt 3 (rev 2): giao diện chat CHUNG cho cả hội thoại (key preset, FE diễn giải).
    // Mọi thành viên đều thấy — trước đây per-user trên Member, chuyển lên conversation-level
    // theo yêu cầu đồng bộ theme. Doc cũ thiếu field → default null (no migration).
    public string? Wallpaper { get; set; }
    public string? BubbleColor { get; set; }
    // public DateTime? DeletedTime { get; set; }
    public List<Member> Members { get; set; } = new List<Member>();
    public List<Message> Messages { get; set; } = new List<Message>();
}