namespace MyConnect.Model
{
    public class NotificationEvent
    {
        public const string NewMessage = "NewMessage";
        public const string AddMember = "AddMember";
        public const string NewConversation = "NewConversation";
        public const string NewFriendRequest = "NewFriendRequest";
    }

    public class NotificationSourceType
    {
        public const string FriendRequest = "friend_request";
    }
}