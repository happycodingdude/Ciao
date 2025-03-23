namespace Application.WebSocketEvents;

public static class ChatEventNames
{
    public const string NewMessage = "NewMessage";
    public const string NewConversation = "NewConversation";
    public const string NewMembers = "NewMembers";
    public const string NewFriendRequest = "NewFriendRequest";
    public const string FriendRequestAccepted = "FriendRequestAccepted";
    public const string FriendRequestCanceled = "FriendRequestCanceled";
    public const string NewReaction = "NewReaction";
}