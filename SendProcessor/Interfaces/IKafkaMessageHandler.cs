namespace SendProcessor.Interfaces;

public interface IKafkaMessageHandler
{
    Task SaveNewMessage(NewMessageModel param);
    Task NotifyNewConversation(NewGroupConversationModel param);
}