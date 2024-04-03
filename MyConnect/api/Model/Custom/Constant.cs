namespace MyConnect.Model
{
    public class NotificationEvent
    {
        public const string NewMessage = "NewMessage";
        public const string AddMember = "AddMember";
        public const string NewConversation = "NewConversation";
        public const string NewFriendRequest = "NewFriendRequest";
        public const string AcceptFriendRequest = "AcceptFriendRequest";
        public const string CancelFriendRequest = "CancelFriendRequest";
        public const string NewNotification = "NewNotification";
    }

    public class NotificationSourceType
    {
        public const string FriendRequest = "friend_request";
    }
}