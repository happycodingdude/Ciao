namespace Application.Kafka.Model;

public static class Topic
{
    public const string NewMessage = "new_message";
    public const string NewStoredMessage = "new_stored_message";
    public const string NewGroupConversation = "new_group_conversation";
    public const string NewStoredGroupConversation = "new_stored_group_conversation";
    public const string NewDirectConversation = "new_direct_conversation";
    public const string NewStoredDirectConversation = "new_stored_direct_conversation";
    public const string NewMember = "new_member";
}