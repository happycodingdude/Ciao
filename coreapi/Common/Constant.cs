namespace MyDockerWebAPI.Common
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
}