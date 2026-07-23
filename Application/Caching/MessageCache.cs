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

    // Warm lại toàn bộ message cache của 1 hội thoại (dùng cho fallback đọc từ Mongo khi cache lạnh).
    // Cùng triết lý cache-là-nguồn-đọc: ghi thẳng danh sách đã tính sẵn reaction count. An toàn với
    // known-issue read-modify-write của cache này vì chỉ warm khi cache đang null/rỗng (không có gì để clobber),
    // và Mongo vẫn là source-of-truth nên sai lệch tạm thời (nếu có) sẽ tự lành.
    public async Task SetMessages(string conversationId, List<MessageWithReactions> messages)
    {
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messages);
    }

    public async Task AddSystemMessage(string conversationId, MessageWithReactions message)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? new();
        messageCache.Add(message);
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
    }

    // isGroup: Phase 5 — Đợt 2b — auto-reopen member IsDeleted (task 4) CHỈ áp dụng chat 1-1;
    // nhóm không reopen (rời nhóm là rời thật). Mirror đúng guard ở DataStoreConsumer.HandleNewMessage.
    public async Task AddMessages(string userId, string conversationId, DateTime updatedTime, MessageWithReactions message, bool isGroup)
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
            conversationInfo.LastMessage = AppConstants.BuildLastMessagePreview(
                message.Type, message.Content, message.Attachments.Select(q => q.MediaName));
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
        if (!isGroup)
        {
            var memberCacheTask = Task.Run(async () =>
            {
                var members = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? new();
                members.ForEach(m => m.IsDeleted = false);
                await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), members);
            });
            tasks.Add(memberCacheTask);
        }

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
        // Gỡ ghim (nếu có) do DataStoreConsumer xoá bản ghi PinnedMessage tương ứng khi recall.
        message.Content = string.Empty;
        message.Attachments = new();
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);

        // Recall tin cuối → set LastMessage về placeholder, giữ nguyên LastMessageTime
        // (không scan ngược tìm tin kế trước để tránh chi phí trên unbounded array).
        await UpdateLastMessagePreviewIfMatch(conversationId, messageId, AppConstants.Message_Recalled, hasAttachment: false);
    }

    // ===== Bình chọn (poll): đồng bộ Redis cache = nguồn đọc của GetMessages =====
    // Mirror ĐÚNG logic atomic của DataStoreConsumer để cache khớp Mongo. Trả về Poll đã cập nhật
    // (để fanout realtime) hoặc null khi no-op (message không có trong cache / poll đã đóng /
    // không phải creator) → caller sẽ KHÔNG broadcast.
    // ⚠️ Kế thừa known-issue read-modify-write không nguyên tử của cache này; Mongo là
    // source-of-truth, cache self-heal khi user re-login.
    public async Task<Poll?> UpdatePollVote(string conversationId, string messageId, string userId, string optionKey, bool allowMultiple)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache?.SingleOrDefault(q => q.Id == messageId);
        var poll = message?.Poll;
        if (poll is null || poll.ClosedTime is not null) return null; // no message / poll đã đóng → no-op

        if (allowMultiple)
        {
            // Chọn nhiều: TOGGLE trên option được chọn.
            var option = poll.Options.SingleOrDefault(o => o.Key == optionKey);
            if (option is null) return null; // optionKey không tồn tại → no-op (khớp arrayFilter Mongo)
            if (option.VoterIds.Contains(userId)) option.VoterIds.Remove(userId);
            else option.VoterIds.Add(userId);
        }
        else
        {
            // Chọn một: gỡ phiếu khỏi TẤT CẢ option rồi thêm vào option được chọn.
            foreach (var o in poll.Options) o.VoterIds.Remove(userId);
            var option = poll.Options.SingleOrDefault(o => o.Key == optionKey);
            if (option is not null && !option.VoterIds.Contains(userId)) option.VoterIds.Add(userId);
        }

        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
        return poll;
    }

    public async Task<Poll?> UpdatePollClose(string conversationId, string messageId, string userId)
    {
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache?.SingleOrDefault(q => q.Id == messageId);
        var poll = message?.Poll;
        if (poll is null) return null;
        // Chỉ creator được đóng + idempotent (đã đóng → no-op) — khớp filter Mongo (ContactId==UserId).
        if (message!.ContactId != userId || poll.ClosedTime is not null) return null;

        poll.ClosedTime = DateTime.UtcNow;
        poll.ClosedBy = userId;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
        return poll;
    }

    // Preview Link: gắn thẻ preview vào tin trong Redis cache (nguồn đọc của GetMessages → reload giữ thẻ).
    // Idempotent: chỉ set khi tin còn trong cache, chưa recalled, chưa có preview. Trả false ⇒ CacheConsumer no-op.
    public async Task<bool> UpdateLinkPreview(string conversationId, string messageId, List<LinkPreview> previews)
    {
        if (previews is null || previews.Count == 0) return false;
        var messageCache = await _redisCaching.GetAsync<List<MessageWithReactions>>(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId)) ?? default;
        var message = messageCache?.SingleOrDefault(q => q.Id == messageId);
        if (message is null || message.RecalledTime is not null) return false;
        // Idempotent: đã có preview (singular hoặc list) → no-op.
        if (message.LinkPreview is not null || message.LinkPreviews is { Count: > 0 }) return false;

        message.LinkPreviews = previews;
        message.LinkPreview = previews[0];   // singular = link đầu (backward-compat)
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversationId), messageCache);
        return true;
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