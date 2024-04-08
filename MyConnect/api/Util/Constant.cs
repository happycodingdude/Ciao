namespace MyConnect.Util
{
    public class UserRole
    {
        public const string Admin = "admin";
        public const string User = "user";
    }

    public static class SubmissionStatus
    {
        public const string Draft = "draft";
        public const string Confirm = "confirm";
        public const string Approve = "approve";
        public const string Reject = "reject";
    }

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