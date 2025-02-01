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

    public async Task<List<ConversationCacheModel>> GetConversations()
    {
        // Query list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations") ?? "";
        var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];

        var result = new List<ConversationCacheModel>(conversationIds.Count);
        // Query info cache
        var tasks = conversationIds.Select(async conversationId =>
        {
            var conversationInfo = await _distributedCache.GetStringAsync($"conversation-{conversationId}-info") ?? "";
            lock (result) // Ensure thread safety
            {
                result.Add(JsonConvert.DeserializeObject<ConversationCacheModel>(conversationInfo));
            }
        });
        await Task.WhenAll(tasks);

        result = result.OrderByDescending(q => q.UpdatedTime).ToList();
        return result;
    }

    public async Task SetConversations(List<ConversationCacheModel> conversations)
    {
        await _distributedCache.SetStringAsync($"user-{UserId}-conversations", JsonConvert.SerializeObject(conversations));
    }

    public async Task SetConversations(string userId, List<ConversationWithTotalUnseenWithContactInfo> conversations)
    {
        // Update list conversations cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        _ = _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationsToCache.Select(q => q.Id)));

        var taskToComplete = new List<Task>(conversations.Count * 3);

        // Tasks update conversation info cache
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
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-members", JsonConvert.SerializeObject(conversation.Participants));
        }));

        await Task.WhenAll(taskToComplete);
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, List<ParticipantWithFriendRequestAndContactInfo> members)
    {
        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations") ?? "";
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

    public async Task AddConversation(string userId, ConversationCacheModel conversation, List<ParticipantWithFriendRequestAndContactInfo> members, MessageWithReactions message)
    {
        // Update list conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations") ?? "";
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

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-conversations");
    }
}