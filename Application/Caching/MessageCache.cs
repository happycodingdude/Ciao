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
        return JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
    }

    public async Task AddMessages(string userId, Conversation conversation, MessageWithReactions message)
    {
        // Update message cache
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversation.Id}-messages");
        var messages = JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
        messages.Add(message);
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(messages));

        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData);
        var removeThisConversationId = conversationIds.Where(q => q != conversation.Id).ToList();
        removeThisConversationId.Insert(0, conversation.Id);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(removeThisConversationId));

        // Update conversation info cache
        var conversationInfoCacheData = await _distributedCache.GetStringAsync($"conversation-{conversation.Id}-info");
        var conversationInfo = JsonConvert.DeserializeObject<ConversationCacheModel>(conversationInfoCacheData);
        conversationInfo.LastMessageId = message.Id;
        conversationInfo.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        conversationInfo.LastMessageTime = message.CreatedTime;
        conversationInfo.LastMessageContact = userId;
        conversationInfo.UpdatedTime = conversation.UpdatedTime;
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-info", JsonConvert.SerializeObject(conversationInfo));

        // Update member cache
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversation.Id}-members");
        var members = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        members.ForEach(member => member.IsDeleted = false);
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-members", JsonConvert.SerializeObject(members));
    }

    public async Task RemoveAll(List<string> conversationIds)
    {
        var tasks = new List<Task>();
        foreach (var id in conversationIds)
        {
            var key = $"conversation-{id}-messages";
            tasks.Add(_distributedCache.RemoveAsync(key));
        }

        await Task.WhenAll(tasks);
    }
}