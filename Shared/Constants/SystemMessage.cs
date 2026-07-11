namespace Shared.Constants;

public partial class AppConstants
{
    public const string SystemMessage_CreatedConversation = "{user} created this conversation";
    public const string SystemMessage_AddedMembers = "{user} added new members: {members}";
    // Đổi theme chat (wallpaper/bubble/theme sự kiện) — dòng hệ thống giữa khung chat.
    // ChangedThemeTo dùng khi xác định được tên theme (wallpaper == bubbleColor, key thuộc
    // bộ preset đã biết); ResetTheme khi bấm Default; ChangedTheme là fallback chung.
    public const string SystemMessage_ChangedTheme = "{user} changed the chat theme";
    public const string SystemMessage_ChangedThemeTo = "{user} changed the chat theme to {theme}";
    public const string SystemMessage_ResetTheme = "{user} reset the chat theme to default";

    // Placeholder cho message đã thu hồi (recall) — dùng để overwrite Content và ReplyContent
    // (reply chain) tránh leak nội dung đã thu hồi qua API fetch / preview.
    public const string Message_Recalled = "[Tin nhắn đã được thu hồi]";
}