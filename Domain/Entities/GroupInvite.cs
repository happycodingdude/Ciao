namespace Domain.Entities;

// Phase 5 — Đợt 2: link mời nhóm, nested trên Conversation (mỗi nhóm tối đa 1 link active).
// Tạo link mới = thay Code mới (link cũ tự vô hiệu); thu hồi = set Invite null trên Conversation.
public class GroupInvite
{
    public string Code { get; set; } = null!;
    // true = người vào bằng link phải chờ quản trị duyệt (JoinRequest); false = vào thẳng.
    public bool RequireApproval { get; set; }
    // null = không hết hạn.
    public DateTime? ExpireTime { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;
}

// Yêu cầu tham gia đang chờ duyệt. Chỉ giữ pending — duyệt/từ chối/rút đều pull khỏi mảng
// (cho phép gửi lại sau khi bị từ chối, đúng chính sách hiện tại).
public class JoinRequest
{
    public string ContactId { get; set; } = null!;
    public DateTime RequestedTime { get; set; } = DateTime.UtcNow;
}
