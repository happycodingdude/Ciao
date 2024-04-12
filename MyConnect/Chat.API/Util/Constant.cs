namespace Chat.API.Util
{
    public partial class Constants
    {
        public const string SubmissionStatus_Draft = "draft";
        public const string SubmissionStatus_Confirm = "confirm";
        public const string SubmissionStatus_Approve = "approve";
        public const string SubmissionStatus_Reject = "reject";
    }

    public partial class Constants
    {
        public const string NotificationEvent_NewMessage = "NewMessage";
        public const string NotificationEvent_AddMember = "AddMember";
        public const string NotificationEvent_NewConversation = "NewConversation";
        public const string NotificationEvent_NewFriendRequest = "NewFriendRequest";
        public const string NotificationEvent_AcceptFriendRequest = "AcceptFriendRequest";
        public const string NotificationEvent_CancelFriendRequest = "CancelFriendRequest";
        public const string NotificationEvent_NewNotification = "NewNotification";
    }

    public partial class Constants
    {
        public const string NotificationSourceType_FriendRequest = "friend_request";
    }
}