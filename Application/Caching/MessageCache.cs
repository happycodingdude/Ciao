namespace Application.Caching;

public class MessageCache
{
    readonly IRedisCaching _redisCaching;

    public MessageCache(IRedisCaching redisCaching)
    {
        _redisCaching = redisCaching;
    }

    public async Task<List<MessageWithReactions>> GetMessages(string conversationId)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>($"conversation-{conversationId}-messages") ?? default;
        return messageCache;
    }

    // public async Task AddMessages(string userId, string conversationId, DateTime updatedTime, MessageWithReactions message)
    // {
    //     // Update message cache
    //     var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>($"conversation-{conversationId}-messages") ?? default;
    //     messageCache.Add(message);
    //     await _redisCaching.SetAsync($"conversation-{conversationId}-messages", messageCache);

    //     // Update list conversation cache
    //     var conversationCacheData = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? default;
    //     var isConversationAtTop = conversationCacheData.IndexOf(conversationId) == 0;
    //     if (!isConversationAtTop)
    //     {
    //         var removeThisConversationId = conversationCacheData.Where(q => q != conversationId).ToList();
    //         removeThisConversationId.Insert(0, conversationId);
    //         await _redisCaching.SetAsync($"user-{userId}-conversations", removeThisConversationId);
    //     }

    //     // Update conversation info cache
    //     var conversationInfoCacheData = await _redisCaching.GetAsync<ConversationCacheModel>($"conversation-{conversationId}-info") ?? default;
    //     conversationInfoCacheData.LastMessageId = message.Id;
    //     conversationInfoCacheData.LastMessage = message.Type == "text"
    //         ? message.Content
    //         : string.Join(",", message.Attachments.Select(q => q.MediaName));
    //     conversationInfoCacheData.LastMessageTime = message.CreatedTime;
    //     conversationInfoCacheData.LastMessageContact = userId;
    //     conversationInfoCacheData.UpdatedTime = updatedTime;
    //     await _redisCaching.SetAsync($"conversation-{conversationId}-info", conversationInfoCacheData);

    //     // Update member cache
    //     var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
    //     var lastSeenTime = DateTime.Now;
    //     memberCacheData.ForEach(member =>
    //     {
    //         // Mở lại hội thoại nếu có người khác gửi tin nhắn
    //         member.IsDeleted = false;
    //         // Nếu người dùng đang xem hội thoại thì cập nhật thời gian cuối cùng xem
    //         if (member.IsSelected)
    //             member.LastSeenTime = lastSeenTime;
    //     });
    //     await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);
    // }

    public async Task AddMessages(string userId, string conversationId, DateTime updatedTime, MessageWithReactions message)
    {
        var tasks = new List<Task>(4);

        // 1. Update message cache
        var messageCacheTask = Task.Run(async () =>
        {
            var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>($"conversation-{conversationId}-messages") ?? new();
            messageCache.Add(message);
            await _redisCaching.SetAsync($"conversation-{conversationId}-messages", messageCache);
        });

        tasks.Add(messageCacheTask);

        // 2. Update conversation list cache
        var conversationListTask = Task.Run(async () =>
        {
            var conversationCacheData = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? new();
            if (conversationCacheData.IndexOf(conversationId) != 0)
            {
                var reordered = conversationCacheData.Where(q => q != conversationId).ToList();
                reordered.Insert(0, conversationId);
                await _redisCaching.SetAsync($"user-{userId}-conversations", reordered);
            }
        });

        tasks.Add(conversationListTask);

        // 3. Update conversation info cache
        var conversationInfoTask = Task.Run(async () =>
        {
            var conversationInfo = await _redisCaching.GetAsync<ConversationCacheModel>($"conversation-{conversationId}-info") ?? new();
            conversationInfo.LastMessageId = message.Id;
            conversationInfo.LastMessage = message.Type == "text"
                ? message.Content
                : string.Join(",", message.Attachments.Select(q => q.MediaName));
            conversationInfo.LastMessageTime = message.CreatedTime;
            conversationInfo.LastMessageContact = userId;
            conversationInfo.UpdatedTime = updatedTime;
            await _redisCaching.SetAsync($"conversation-{conversationId}-info", conversationInfo);
        });

        tasks.Add(conversationInfoTask);

        // 4. Update member cache
        var memberCacheTask = Task.Run(async () =>
        {
            var members = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? new();
            var now = DateTime.Now;
            members.ForEach(m =>
            {
                m.IsDeleted = false;
                if (m.IsSelected) m.LastSeenTime = now;
            });
            await _redisCaching.SetAsync($"conversation-{conversationId}-members", members);
        });

        tasks.Add(memberCacheTask);

        // 🏁 Chờ tất cả task hoàn tất song song
        await Task.WhenAll(tasks);
    }


    public async Task<List<MessageReaction>> UpdateReactions(string conversationId, string messageId, string userId, string type)
    {
        // Update message cache
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>($"conversation-{conversationId}-messages") ?? default;
        var message = messageCache.SingleOrDefault(q => q.Id == messageId);
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
                UpdateReactionCount(message, type);
            }
            else
            {
                UpdateReactionCount(message, userReaction.Type, type);
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
            UpdateReactionCount(message, type);
        }

        await _redisCaching.SetAsync($"conversation-{conversationId}-messages", messageCache);

        return message.Reactions;
    }

    void UpdateReactionCount(MessageWithReactions message, string type)
    {
        switch (type)
        {
            case AppConstants.MessageReactionType_Like:
                message.LikeCount++;
                break;
            case AppConstants.MessageReactionType_Love:
                message.LoveCount++;
                break;
            case AppConstants.MessageReactionType_Care:
                message.CareCount++;
                break;
            case AppConstants.MessageReactionType_Wow:
                message.WowCount++;
                break;
            case AppConstants.MessageReactionType_Sad:
                message.SadCount++;
                break;
            case AppConstants.MessageReactionType_Angry:
                message.AngryCount++;
                break;
        }
    }

    void UpdateReactionCount(MessageWithReactions message, string lastType, string newType)
    {
        UpdateReactionCount(message, newType);
        switch (lastType)
        {
            case AppConstants.MessageReactionType_Like:
                message.LikeCount--;
                break;
            case AppConstants.MessageReactionType_Love:
                message.LoveCount--;
                break;
            case AppConstants.MessageReactionType_Care:
                message.CareCount--;
                break;
            case AppConstants.MessageReactionType_Wow:
                message.WowCount--;
                break;
            case AppConstants.MessageReactionType_Sad:
                message.SadCount--;
                break;
            case AppConstants.MessageReactionType_Angry:
                message.AngryCount--;
                break;
        }
    }

    public async Task UpdatePin(string conversationId, string messageId, string userId, bool pinned)
    {
        // Update message cache
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>($"conversation-{conversationId}-messages") ?? default;
        var message = messageCache.SingleOrDefault(q => q.Id == messageId);
        message.IsPinned = pinned;
        message.PinnedBy = userId;

        await _redisCaching.SetAsync($"conversation-{conversationId}-messages", messageCache);
    }
}