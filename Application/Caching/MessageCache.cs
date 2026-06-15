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
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        return messageCache;
    }

    public async Task AddSystemMessage(string conversationId, MessageWithReactions message)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? new();
        messageCache.Add(message);
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
    }

    public async Task AddMessages(string userId, string conversationId, DateTime updatedTime, MessageWithReactions message)
    {
        // ⚠️ RACE CONDITION KNOWN-ISSUE:
        // Cả 4 task dưới đều theo pattern Get → mutate → Set trên Redis (read-modify-write KHÔNG nguyên tử).
        // Nếu 2 message cùng conversation đến đồng thời (cùng host hay khác host), 1 message có thể bị mất
        // do task đến sau ghi đè state cũ của task đến trước.
        // → Hướng cải thiện sau này: dùng Redis list (LPUSH/RPUSH) hoặc transactional script (MULTI/Lua).
        // Tạm thời chấp nhận vì tần suất gửi cùng conversation từ cùng user thấp + có Mongo làm source of truth.
        var tasks = new List<Task>(4);

        // 1. Add message to message cache
        var messageCacheTask = Task.Run(async () =>
        {
            var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? new();
            messageCache.Add(message);
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
        });
        tasks.Add(messageCacheTask);

        // 2. Popup conversation of users to the top.
        //    Chỉ ghi lại khi conversation chưa ở vị trí đầu để tiết kiệm 1 round-trip Redis Set.
        var conversationListTask = Task.Run(async () =>
        {
            var conversationCacheData = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? new();
            if (conversationCacheData.IndexOf(conversationId) != 0)
            {
                var reordered = conversationCacheData.Where(q => q != conversationId).ToList();
                reordered.Insert(0, conversationId);
                await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), reordered);
            }
        });
        tasks.Add(conversationListTask);

        // 3. Update conversation info cache
        var conversationInfoTask = Task.Run(async () =>
        {
            var conversationInfo = await _redisCaching.GetAsync<ConversationCacheModel>(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId)) ?? new();
            conversationInfo.LastMessageId = message.Id;
            conversationInfo.LastMessage = message.Type == "text"
                ? message.Content
                : string.Join(",", message.Attachments.Select(q => q.MediaName));
            conversationInfo.LastMessageTime = message.CreatedTime;
            conversationInfo.LastMessageContact = userId;
            conversationInfo.UpdatedTime = updatedTime;
            conversationInfo.HasAttachment = message.Attachments.Any();
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId), conversationInfo);
        });
        tasks.Add(conversationInfoTask);

        // 4. Reopen conversation for members that are deleted.
        //    Khi có message mới, member nào đã "ẩn" conversation (IsDeleted=true) sẽ được mở lại.
        //    KHÔNG cập nhật LastSeenTime ở đây nữa — read horizon chỉ được nâng qua explicit
        //    event read từ FE (ReadMessage endpoint → MemberCache.MemberSeenAll). Việc tự
        //    đánh dấu seen khi nhận message mới (dựa vào IsSelected) là implicit side-effect
        //    không đáng tin: IsSelected có thể stale, và FE Chatbox đã có debounced markRead
        //    đảm bảo seen khi user thực sự ở cuối conversation.
        var memberCacheTask = Task.Run(async () =>
        {
            var members = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? new();
            members.ForEach(m => m.IsDeleted = false);
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), members);
        });
        tasks.Add(memberCacheTask);

        // 🏁 Chờ tất cả task hoàn tất song song
        await Task.WhenAll(tasks);
    }

    public async Task<List<MessageReaction>> UpdateReactions(string conversationId, string messageId, string userId, string type)
    {
        // ⚠️ RACE CONDITION: read-modify-write trên Redis không nguyên tử — nếu 2 user react cùng lúc,
        // 1 reaction có thể bị mất. Đồng bộ Mongo (HandleNewReaction) là source of truth, cache có thể
        // tự healed khi user re-login (HandleUserLogin nạp lại từ DB).
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache.SingleOrDefault(q => q.Id == messageId);
        // Nhánh 1: message đã có reaction → cần phân biệt user mới react vs đổi loại react.
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

        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);

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
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache.SingleOrDefault(q => q.Id == messageId);
        message.IsPinned = pinned;
        message.PinnedBy = userId;

        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
    }

    // ===== Tính năng 2: edit / recall / delete-for-me =====
    // Tất cả đều idempotent ở app layer (chỉ apply forward / no-op khi duplicate/out-of-order).
    // Kế thừa known-issue read-modify-write không nguyên tử của cache này; Mongo (DataStoreConsumer)
    // là source-of-truth, cache self-heal khi user re-login.

    public async Task UpdateEdited(string conversationId, string messageId, string content, DateTime editedTime)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache?.SingleOrDefault(q => q.Id == messageId);
        if (message is null) return;
        // Idempotent: chỉ apply nếu editedTime mới hơn (chống out-of-order khi multi-device cùng edit).
        if (message.EditedTime is not null && message.EditedTime >= editedTime) return;

        message.Content = content;
        message.EditedTime = editedTime;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);

        // Nếu là tin cuối của conversation → đồng bộ preview trong conversation info cache.
        await UpdateLastMessagePreviewIfMatch(conversationId, messageId, content, hasAttachment: message.Attachments.Any());
    }

    public async Task UpdateRecalled(string conversationId, string messageId, DateTime recalledTime, string recalledByContactId)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache?.SingleOrDefault(q => q.Id == messageId);
        if (message is null) return;
        // No-op nếu đã recalled (idempotent với duplicate event / multi-device).
        if (message.RecalledTime is not null) return;

        message.RecalledTime = recalledTime;
        message.RecalledByContactId = recalledByContactId;
        // Clear nội dung/attachment để API fetch (cache) không trả về nội dung đã thu hồi.
        message.Content = string.Empty;
        message.Attachments = new();
        message.IsPinned = false;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);

        // Recall tin cuối → set LastMessage về placeholder, giữ nguyên LastMessageTime
        // (không scan ngược tìm tin kế trước để tránh chi phí trên unbounded array).
        await UpdateLastMessagePreviewIfMatch(conversationId, messageId, AppConstants.Message_Recalled, hasAttachment: false);
    }

    async Task UpdateLastMessagePreviewIfMatch(string conversationId, string messageId, string preview, bool hasAttachment)
    {
        var conversationInfo = await _redisCaching.GetAsync<ConversationCacheModel>(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId)) ?? default;
        if (conversationInfo is null || conversationInfo.LastMessageId != messageId) return;

        conversationInfo.LastMessage = preview;
        conversationInfo.HasAttachment = hasAttachment;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId), conversationInfo);
    }
}