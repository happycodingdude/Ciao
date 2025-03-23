namespace Application.Kafka.Model;

public static class Topic
{
    public const string UserLogin = "user.login";
    public const string UserLogout = "user.logout";
    public const string NewMessage = "message.new";
    public const string StoredMessage = "message.stored";
    public const string NewGroupConversation = "conversation.new";
    public const string StoredGroupConversation = "conversation.stored";
    public const string NewDirectConversation = "direct-conversation.new";
    public const string StoredDirectConversation = "direct-conversation.stored";
    public const string NewMember = "member.new";
    public const string StoredMember = "member.stored";
    public const string NewReaction = "reaction.new";
    public const string StoredReaction = "reaction.stored";
    public const string NotifyNewReaction = "reaction.notify";
}