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
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages") ?? "";
        return JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
    }

    public async Task AddMessages(string userId, string conversationId, DateTime updatedTime, MessageWithReactions message)
    {
        // Update message cache
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages") ?? "";
        var messages = JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
        messages.Add(message);
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-messages", JsonConvert.SerializeObject(messages));

        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData);
        var isConversationAtTop = conversationIds.IndexOf(conversationId) == 0;
        if (!isConversationAtTop)
        {
            var removeThisConversationId = conversationIds.Where(q => q != conversationId).ToList();
            removeThisConversationId.Insert(0, conversationId);
            await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(removeThisConversationId));
        }

        // Update conversation info cache
        var conversationInfoCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-info") ?? "";
        var conversationInfo = JsonConvert.DeserializeObject<ConversationCacheModel>(conversationInfoCacheData);
        conversationInfo.LastMessageId = message.Id;
        conversationInfo.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        conversationInfo.LastMessageTime = message.CreatedTime;
        conversationInfo.LastMessageContact = userId;
        conversationInfo.UpdatedTime = updatedTime;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-info", JsonConvert.SerializeObject(conversationInfo));

        // Update member cache
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        var members = JsonConvert.DeserializeObject<List<MemberWithContactInfo>>(memberCacheData) ?? [];
        var lastSeenTime = DateTime.Now;
        members.ForEach(member =>
        {
            member.IsDeleted = false;
            if (member.Id != userId && member.IsSelected)
                member.LastSeenTime = lastSeenTime;
        });
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task UpdateReactions(string conversationId, string messageId, string userId, string type)
    {
        // Update message cache
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages") ?? "";
        var messages = JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
        var message = messages.SingleOrDefault(q => q.Id == messageId);
        if (message.Reactions.Any())
        {
            var userReaction = message.Reactions.SingleOrDefault(q => q.ContactId == userId);
            if (userReaction is null)
            {
                message.Reactions.Add(new MessageReaction
                {
                    ContactId = userId,
                    Type = type
                });
            }
            else
            {
                userReaction.Type = type;
            }
        }
        else
        {
            message.Reactions.Add(new MessageReaction
            {
                ContactId = userId,
                Type = type
            });
        }

        await _distributedCache.SetStringAsync($"conversation-{conversationId}-messages", JsonConvert.SerializeObject(messages));
    }
}