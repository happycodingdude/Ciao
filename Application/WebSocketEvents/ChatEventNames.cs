namespace Application.WebSocketEvents;

public static class ChatEventNames
{
    public const string NewMessage = "NewMessage";
    public const string NewConversation = "NewConversation";
    public const string NewMembers = "NewMembers";
    public const string NewFriendRequest = "NewFriendRequest";
    public const string FriendRequestAccepted = "FriendRequestAccepted";
    public const string FriendRequestCanceled = "FriendRequestCanceled";
    public const string FriendRequestDenied = "FriendRequestDenied";
    public const string Unfriended = "Unfriended";
    public const string NewReaction = "NewReaction";
    public const string NewMessagePinned = "NewMessagePinned";
    public const string ContactUpdated = "ContactUpdated";
    public const string MessageDelivered = "MessageDelivered";
    public const string MessageRead = "MessageRead";
    public const string MessageEdited = "MessageEdited";
    public const string MessageRecalled = "MessageRecalled";
    public const string PollUpdated = "PollUpdated";
    public const string LinkPreviewReady = "LinkPreviewReady";
    // Phase 3: biệt danh thành viên trong hội thoại thay đổi (mọi thành viên đều thấy).
    public const string MemberNicknameChanged = "MemberNicknameChanged";
    // Phase 3: theme chat (hình nền + màu bong bóng) của hội thoại thay đổi — chung cho mọi thành viên.
    public const string ConversationAppearanceChanged = "ConversationAppearanceChanged";
    // Phase 5 — Đợt 2: có yêu cầu tham gia mới / yêu cầu được duyệt-từ chối-rút
    // → FE invalidate hàng chờ join-requests + danh sách notification.
    public const string JoinRequestUpdated = "JoinRequestUpdated";
    // Phase 5 — Đợt 2b: thành viên rời nhóm — member còn lại cập nhật danh sách + system message;
    // thiết bị khác của người rời ẩn hội thoại khỏi danh sách.
    public const string MemberLeft = "MemberLeft";
    // Phase 5 — fix tồn đọng: có người vào nhóm qua link (vào thẳng, không duyệt) — gửi quản trị.
    // Payload kèm actor (tên/avatar/tên nhóm) để FE hiện banner + refresh badge notification.
    // (Khác JoinRequestUpdated: sự kiện này là "đã vào", không phải thay đổi hàng chờ.)
    public const string MemberJoinedByLink = "MemberJoinedByLink";
}