namespace Shared.Constants;

public partial class AppConstants
{
    public const string NotificationSourceType_FriendRequest = "friend_request";
    // Phase 5 — Đợt 2: yêu cầu tham gia nhóm (gửi cho quản trị) và kết quả duyệt (gửi cho người xin).
    public const string NotificationSourceType_JoinRequest = "join_request";
    // Phase 5 — Đợt 2 (fix tồn đọng): thành viên vào nhóm qua link KHÔNG cần duyệt —
    // báo cho quản trị (luồng duyệt đã có join_request nên không dùng loại này).
    public const string NotificationSourceType_MemberJoined = "member_joined";
}
