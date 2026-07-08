namespace Shared.Constants;

public partial class AppConstants
{
    public const string RedisKey_UserToken = "user:{userId}:token";
    public const string RedisKey_UserConnection = "user:{userId}:connection";
    public const string RedisKey_UserInfo = "user:{userId}:info";
    public const string RedisKey_UserConversations = "user:{userId}:conversations";
    public const string RedisKey_UserFriends = "user:{userId}:friends";
    public const string RedisKey_ConversationInfo = "conversation:{conversationId}:info";
    public const string RedisKey_ConversationMembers = "conversation:{conversationId}:members";
    public const string RedisKey_ConversationMessages = "conversation:{conversationId}:messages";
    // Preview Link: cache thẻ preview theo URL (hash) → tránh fetch lại cùng 1 link nhiều lần
    // (link viral gửi bởi N người chỉ fetch ngoài 1 lần trong TTL). {hash} = SHA-256 hex của URL.
    public const string RedisKey_LinkPreviewUrl = "linkpreview:url:{hash}";
}