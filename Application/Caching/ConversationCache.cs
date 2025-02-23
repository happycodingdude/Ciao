namespace Application.Caching;

public class ConversationCache
{
    readonly IDistributedCache _distributedCache;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IMapper _mapper;

    public ConversationCache(IDistributedCache distributedCache, IHttpContextAccessor httpContextAccessor, IMapper mapper)
    {
        _distributedCache = distributedCache;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public async Task<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>> GetConversations()
    {
        // Query list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];

        var result = new List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationIds.Count);
        // Query info cache
        var tasks = conversationIds.Select(async conversationId =>
        {
            var conversationInfo = await _distributedCache.GetStringAsync($"conversation-{conversationId}-info") ?? "";
            lock (result) // Ensure thread safety
            {
                // var item = JsonConvert.DeserializeObject<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationInfo);
                // item.UnSeenMessages = conversation.UnSeenMessages;
                result.Add(JsonConvert.DeserializeObject<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationInfo));
            }
        });
        await Task.WhenAll(tasks);

        result = result.OrderByDescending(q => q.UpdatedTime).ToList();
        return result;
    }

    public async Task<string[]> GetListConversationId(string userId)
    {
        var conversations = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
        return JsonConvert.DeserializeObject<string[]>(conversations);
    }

    public async Task<ConversationCacheModel> GetConversationInfo(string conversationId)
    {
        var conversationInfo = await _distributedCache.GetStringAsync($"conversation-{conversationId}-info") ?? "";
        return JsonConvert.DeserializeObject<ConversationCacheModel>(conversationInfo);
    }

    // public async Task UpdateTotalUnseen(string userId, string conversationId, int total)
    // {
    //     // Query list conversation cache
    //     var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
    //     var conversations = JsonConvert.DeserializeObject<List<ListConversationCacheModel>>(conversationCacheData) ?? [];
    //     var selected = conversations.SingleOrDefault(q => q.Id == conversationId);
    //     selected.UnSeenMessages = total;
    //     _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    // }

    // public async Task UpdateTotalUnseen(string conversationId, int total)
    // {
    //     await UpdateTotalUnseen(UserId, conversationId, total);
    // }

    public async Task SetConversation(string conversationId, ConversationCacheModel conversation)
    {
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-info", JsonConvert.SerializeObject(conversation));
    }

    public async Task SetConversations(string userId, List<ConversationWithTotalUnseenWithContactInfo> conversations)
    {
        // Update list conversations cache
        _ = _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations.Select(q => q.Id)));

        var taskToComplete = new List<Task>(conversations.Count * 3);

        // Tasks update conversation info cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        taskToComplete.AddRange(conversationsToCache.Select(async conversation =>
        {
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-info", JsonConvert.SerializeObject(conversation));
        }));

        // Tasks update message cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(conversation.Messages));
        }));

        // Tasks update member cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-members", JsonConvert.SerializeObject(conversation.Members));
        }));

        await Task.WhenAll(taskToComplete);
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, List<MemberWithContactInfo> members)
    {
        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];
        conversationIds.Insert(0, conversation.Id);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationIds));

        // Update conversation info cache
        conversation.UpdatedTime = DateTime.Now;
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-info", JsonConvert.SerializeObject(conversation));

        // Update member cache
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-members", JsonConvert.SerializeObject(members));

        // Update message cache
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(new List<MessageWithReactions>() { }));
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, List<MemberWithContactInfo> members, MessageWithReactions message)
    {
        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];
        conversationIds.Insert(0, conversation.Id);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationIds));

        // Update conversation info cache
        conversation.LastMessageId = message.Id;
        conversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        conversation.LastMessageTime = message.CreatedTime;
        conversation.LastMessageContact = userId;
        conversation.UpdatedTime = DateTime.Now;
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-info", JsonConvert.SerializeObject(conversation));

        // Update member cache
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-members", JsonConvert.SerializeObject(members));

        // Update message cache
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(new List<MessageWithReactions>(1) { message }));
    }

    public async Task AddConversation(string userId, string conversationId)
    {
        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];
        conversationIds.Insert(0, conversationId);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationIds));
    }

    public async Task AddConversation(string[] userIds, string conversationId)
    {
        var tasks = userIds.Select(async userId =>
        {
            // Update list conversation cache
            var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations") ?? "";
            var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];
            conversationIds.Insert(0, conversationId);
            await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationIds));
        });
        await Task.WhenAll(tasks);
    }

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-conversations");
    }
}