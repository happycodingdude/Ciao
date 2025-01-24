namespace SendProcessor.Interfaces;

public interface IKafkaMessageHandler
{
    Task SaveNewMessage(SaveNewMessageModel param);
    // Task UpdateConversationCache(UpdateConversationCacheModel param);
}