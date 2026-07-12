namespace Shared.Constants;

public partial class AppConstants
{
    public const string Authentication_Basic = "Basic";
    public const string ApiVersion = "v1";
    public const string ApiGroup_Identity = $"/api/{ApiVersion}/identity";
    public const string ApiGroup_Contact = $"/api/{ApiVersion}/contacts";
    public const string ApiGroup_Conversation = $"/api/{ApiVersion}/conversations";
    public const string ApiGroup_Friend = $"/api/{ApiVersion}/friends";
    public const string ApiGroup_Message = $"/api/{ApiVersion}/messages";
    public const string ApiGroup_Notification = $"/api/{ApiVersion}/notifications";
    public const string ApiGroup_Member = $"/api/{ApiVersion}/members";
    public const string ApiGroup_Attachment = $"/api/{ApiVersion}/attachments";
    public const string ApiGroup_Presence = $"/api/{ApiVersion}/presence";
    public const string ApiGroup_LinkPreview = $"/api/{ApiVersion}/link-preview";
    public const string ApiGroup_Bookmark = $"/api/{ApiVersion}/bookmarks";
    // Phase 5 — Đợt 2: link mời nhóm (lookup theo code, không lộ conversationId trên URL).
    public const string ApiGroup_Invite = $"/api/{ApiVersion}/invites";
}
