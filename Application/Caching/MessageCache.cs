namespace Application.Caching;

public class MessageCache
{
    readonly IDistributedCache _distributedCache;

    public MessageCache(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<List<MessageWithReactions>> GetMessages(string conversationId)
    {
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages");
        return JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache);
    }

    public async Task SetMessages(string userId, string conversationId, MessageWithReactions message)
    {
        // Update message cache
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages");
        var messages = JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
        messages.Add(message);
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-messages", JsonConvert.SerializeObject(messages));

        // Update conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(conversationCacheData) ?? [];
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.LastMessageId = message.Id;
        selectedConversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        selectedConversation.LastMessageTime = message.CreatedTime;
        selectedConversation.LastMessageContact = userId;
        // Order by LastMessageTime to pop it up to top
        conversations = conversations.OrderByDescending(q => q.LastMessageTime).ToList();
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    }
}