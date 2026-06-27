using Application.WebSocketEvents;

namespace Application.Notifications;

// Sinh (title, body) có nghĩa cho banner OS thay cho chuỗi cứng "Ciao notify".
// CHỈ chạy cho nhóm banner (banner=true) — data-only không cần.
// Giữ logic ở Application (thuần, testable) thay vì nhét trong FirebaseFunction.
//
// Lưu ý: chỉ các event có dữ liệu đủ giàu (NewMessage) mới render được "sender + preview".
// Event khác (reaction/friend-request) hiện không kèm tên actor trong payload FCM ⇒ fallback chung.
public static class NotificationBanner
{
    const string AppName = "Ciao";
    const int PreviewMaxLength = 120;

    public static (string title, string body) Build(string _event, object? data)
    {
        switch (_event)
        {
            case ChatEventNames.NewMessage when data is EventNewMessage m:
                return BuildNewMessage(m);

            case ChatEventNames.NewConversation when data is EventNewConversation c:
                return (Fallback(c.Conversation?.Title, AppName), "New conversation");

            case ChatEventNames.NewMembers when data is EventNewConversation c:
                return (Fallback(c.Conversation?.Title, AppName), "You were added to the group");

            case ChatEventNames.NewReaction when data is EventNewReaction r:
                return (AppName, $"{Fallback(r.ReactorName, "Someone")} reacted to your message");

            case ChatEventNames.NewReaction:
                return (AppName, "New reaction to your message");

            case ChatEventNames.NewFriendRequest when data is EventNewFriendRequest f:
                return (AppName, $"{Fallback(f.ContactName, "Someone")} sent you a friend request");

            case ChatEventNames.NewFriendRequest:
                return (AppName, "You have a new friend request");

            case ChatEventNames.FriendRequestAccepted:
                return (AppName, "Your friend request was accepted");

            default:
                return (AppName, "New notification");
        }
    }

    static (string title, string body) BuildNewMessage(EventNewMessage m)
    {
        var sender = Fallback(m.Contact?.Name, "Someone");
        var preview = MessagePreview(m);

        // Group: tiêu đề là tên nhóm, kèm tên người gửi trong body để biết ai nhắn.
        // 1-1: tiêu đề là tên người gửi.
        if (m.Conversation?.IsGroup == true)
            return (Fallback(m.Conversation.Title, sender), $"{sender}: {preview}");

        return (sender, preview);
    }

    static string MessagePreview(EventNewMessage m)
    {
        if (m.Type == "text")
            return Truncate(m.Content);

        // media: Content bị set null ở consumer → suy ra preview từ attachments.
        var attachments = m.Attachments;
        if (attachments is null || attachments.Count == 0)
            return "Sent an attachment";

        var images = attachments.Count(a => a.Type == "image");
        var files = attachments.Count(a => a.Type == "file");

        if (files == 0 && images > 0)
            return images == 1 ? "📷 Photo" : $"📷 {images} photos";
        if (images == 0 && files > 0)
            return files == 1 ? "📎 File" : $"📎 {files} files";

        return $"📎 {attachments.Count} attachments";
    }

    static string Truncate(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "New message";
        var trimmed = text.Trim();
        if (trimmed.Length <= PreviewMaxLength) return trimmed;
        return string.Concat(trimmed.AsSpan(0, PreviewMaxLength), "…");
    }

    static string Fallback(string? value, string fallback)
        => string.IsNullOrWhiteSpace(value) ? fallback : value;
}
