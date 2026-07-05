namespace Application.Caching;

public class ConversationCache
{
    readonly IRedisCaching _redisCaching;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IMapper _mapper;

    public ConversationCache(IRedisCaching redisCaching, IHttpContextAccessor httpContextAccessor, IMapper mapper)
    {
        _redisCaching = redisCaching;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public async Task<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>> GetConversations(int page, int limit)
    {
        // Query list conversation cache
        var conversationCacheData = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", UserId)) ?? default;
        if (conversationCacheData is null)
            return default;

        // Paginate
        conversationCacheData = conversationCacheData
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToList();

        var result = new List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationCacheData.Count);
        // Fan-out fetch info song song qua Redis (mỗi conversation 1 GET).
        // List<T>.Add KHÔNG thread-safe → cần lock để tránh corrupt internal array khi nhiều task hoàn tất cùng lúc.
        // Vì các task chỉ block ngắn ở Add (không chờ I/O bên trong lock), contention ở mức thấp.
        // Sau đó OrderByDescending khôi phục thứ tự theo UpdatedTime — KHÔNG dựa vào thứ tự fetch về.
        var tasks = conversationCacheData.Select(async conversationId =>
        {
            var conversationInfo = await _redisCaching.GetAsync<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(
                AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId)) ?? default;
            lock (result) // Ensure thread safety
            {
                result.Add(conversationInfo);
            }
        });
        await Task.WhenAll(tasks);

        result = result.OrderByDescending(q => q.UpdatedTime).ToList();
        return result;
    }

    public async Task<string[]> GetListConversationId(string userId)
    {
        var conversations = await _redisCaching.GetAsync<string[]>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? default;
        return conversations;
    }

    public async Task<ConversationCacheModel> GetConversationInfo(string conversationId)
    {
        var conversationInfo = await _redisCaching.GetAsync<ConversationCacheModel>(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId)) ?? default;
        return conversationInfo;
    }

    // public async Task UpdateTotalUnseen(string userId, string conversationId, int total)
    // {
    //     // Query list conversation cache
    //     var conversationCacheData = await _redisCaching.GetAsync<($"user-{userId}-conversations") ?? "";
    //     var conversations = JsonConvert.DeserializeObject<List<ListConversationCacheModel>>(conversationCacheData) ?? [];
    //     var selected = conversations.SingleOrDefault(q => q.Id == conversationId);
    //     selected.UnSeenMessages = total;
    //     _redisCaching.SetAsync($"user-{userId}-conversations", conversations));
    // }

    // public async Task UpdateTotalUnseen(string conversationId, int total)
    // {
    //     await UpdateTotalUnseen(UserId, conversationId, total);
    // }

    public async Task SetConversation(string conversationId, ConversationCacheModel conversation)
    {
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId), conversation);
    }

    public async Task SetConversations(string userId, List<ConversationWithTotalUnseenWithContactInfo> conversations)
    {
        // Update list conversations cache
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), conversations.Select(q => q.Id));

        var taskToComplete = new List<Task>(conversations.Count * 3);

        // Tasks update conversation info cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        taskToComplete.AddRange(conversationsToCache.Select(async conversation =>
        {
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversation.Id), conversation);
        }));

        // Tasks update message cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversation.Id), conversation.Messages);
        }));

        // Tasks update member cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversation.Id), conversation.Members);
        }));

        await Task.WhenAll(taskToComplete);
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, MemberWithContactInfo[] members)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? default;
        conversationIds.Insert(0, conversation.Id);
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), conversationIds);

        // Update conversation info cache
        conversation.UpdatedTime = DateTime.UtcNow;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversation.Id), conversation);
        // Update member cache
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversation.Id), members);

        // Update message cache
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversation.Id), Enumerable.Empty<MessageWithReactions>());
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, MemberWithContactInfo[] members, MessageWithReactions message)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? default;
        conversationIds.Insert(0, conversation.Id);
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), conversationIds);

        // Update conversation info cache
        conversation.LastMessageId = message.Id;
        conversation.LastMessage = AppConstants.BuildLastMessagePreview(
            message.Type, message.Content, message.Attachments.Select(q => q.MediaName));
        conversation.LastMessageTime = message.CreatedTime;
        conversation.LastMessageContact = userId;
        conversation.UpdatedTime = DateTime.UtcNow;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversation.Id), conversation);

        // Update member cache
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversation.Id), members);
        // Update message cache
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMessages.Replace("{conversationId}", conversation.Id), new List<MessageWithReactions>(1) { message });
    }

    public async Task AddConversation(string userId, string conversationId)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? default;
        conversationIds.Insert(0, conversationId);
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), conversationIds);
    }

    public async Task AddConversation(string[] userIds, string conversationId)
    {
        var tasks = userIds.Select(async userId =>
        {
            // Update list conversation cache
            var conversationIds = await _redisCaching.GetAsync<List<string>>(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId)) ?? default;
            conversationIds.Insert(0, conversationId);
            await _redisCaching.SetAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId), conversationIds);
        });
        await Task.WhenAll(tasks);
    }

    public void RemoveAll()
    {
        _ = _redisCaching.DeleteAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", UserId));
    }

    public void RemoveAll(string userId)
    {
        _ = _redisCaching.DeleteAsync(AppConstants.RedisKey_UserConversations.Replace("{userId}", userId));
    }
}