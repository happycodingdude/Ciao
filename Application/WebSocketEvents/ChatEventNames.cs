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
}