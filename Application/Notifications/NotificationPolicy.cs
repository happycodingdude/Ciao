using Application.WebSocketEvents;

namespace Application.Notifications;

// Quyết định 1 event FCM có được hiện banner (push notification) cho người nhận hay không.
// Mọi event đều LUÔN gửi block `data` (driver realtime của FE) — chỉ block `notification`
// (title/body → banner OS) mới bị cắt theo preference. Nhờ vậy tắt thông báo KHÔNG làm vỡ realtime.
//
// Event không nằm trong Gates => "sync-only": luôn data-only, không bao giờ banner
// (delivered/read/edited/recalled/pinned/cancel/deny/unfriend).
public static class NotificationPolicy
{
    static readonly Dictionary<string, Func<ContactSettings, bool>> Gates = new()
    {
        [ChatEventNames.NewMessage]            = s => s.NotifyOnMessage,
        [ChatEventNames.NewConversation]       = s => s.NotifyOnMessage,
        [ChatEventNames.NewMembers]            = s => s.NotifyOnMessage,
        [ChatEventNames.NewReaction]           = s => s.NotifyOnReaction,
        [ChatEventNames.NewFriendRequest]      = s => s.NotifyOnFriendRequest,
        [ChatEventNames.FriendRequestAccepted] = s => s.NotifyOnFriendRequest,
    };

    // Event này có khái niệm banner không? false => sync-only (chỉ data).
    public static bool IsBannerable(string _event) => Gates.ContainsKey(_event);

    // Có hiện banner cho recipient này không?
    // Fail-open: settings null (cache miss) => vẫn hiện banner (mặc định bật) — đồng nhất
    // với UserCache.IsOnlineVisibleAsync. PushEnabled là master switch (Phase 2).
    public static bool ShouldShowBanner(string _event, ContactSettings? settings)
    {
        if (!Gates.TryGetValue(_event, out var gate)) return false; // sync-only
        if (settings is null) return true;                          // fail-open
        return settings.PushEnabled && gate(settings);
    }
}
