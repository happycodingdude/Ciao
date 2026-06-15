namespace Shared.Constants;

public partial class AppConstants
{
    public const string SystemMessage_CreatedConversation = "{user} created this conversation";
    public const string SystemMessage_AddedMembers = "{user} added new members: {members}";

    // Placeholder cho message đã thu hồi (recall) — dùng để overwrite Content và ReplyContent
    // (reply chain) tránh leak nội dung đã thu hồi qua API fetch / preview.
    public const string Message_Recalled = "[Tin nhắn đã được thu hồi]";
}