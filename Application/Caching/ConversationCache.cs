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

    public async Task<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>> GetConversations()
    {
        // Query list conversation cache
        var conversationCacheData = await _redisCaching.GetAsync<List<string>>($"user-{UserId}-conversations") ?? default;

        var result = new List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationCacheData.Count);
        // Query info cache
        var tasks = conversationCacheData.Select(async conversationId =>
        {
            var conversationInfo = await _redisCaching.GetAsync<ConversationWithTotalUnseenWithContactInfoAndNoMessage>($"conversation-{conversationId}-info") ?? default;
            lock (result) // Ensure thread safety
            {
                // var item = JsonConvert.DeserializeObject<ConversationWithTotalUnseenWithContactInfoAndNoMessage>(conversationInfo);
                // item.UnSeenMessages = conversation.UnSeenMessages;
                result.Add(conversationInfo);
            }
        });
        await Task.WhenAll(tasks);

        result = result.OrderByDescending(q => q.UpdatedTime).ToList();
        return result;
    }

    public async Task<string[]> GetListConversationId(string userId)
    {
        var conversations = await _redisCaching.GetAsync<string[]>($"user-{userId}-conversations") ?? default;
        return conversations;
    }

    public async Task<ConversationCacheModel> GetConversationInfo(string conversationId)
    {
        var conversationInfo = await _redisCaching.GetAsync<ConversationCacheModel>($"conversation-{conversationId}-info") ?? default;
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
        await _redisCaching.SetAsync($"conversation-{conversationId}-info", conversation);
    }

    public async Task SetConversations(string userId, List<ConversationWithTotalUnseenWithContactInfo> conversations)
    {
        // Update list conversations cache
        _ = _redisCaching.SetAsync($"user-{userId}-conversations", conversations.Select(q => q.Id));

        var taskToComplete = new List<Task>(conversations.Count * 3);

        // Tasks update conversation info cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        taskToComplete.AddRange(conversationsToCache.Select(async conversation =>
        {
            await _redisCaching.SetAsync($"conversation-{conversation.Id}-info", conversation);
        }));

        // Tasks update message cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _redisCaching.SetAsync($"conversation-{conversation.Id}-messages", conversation.Messages);
        }));

        // Tasks update member cache
        taskToComplete.AddRange(conversations.Select(async conversation =>
        {
            await _redisCaching.SetAsync($"conversation-{conversation.Id}-members", conversation.Members);
        }));

        await Task.WhenAll(taskToComplete);
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, MemberWithContactInfo[] members)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? default;
        conversationIds.Insert(0, conversation.Id);
        await _redisCaching.SetAsync($"user-{userId}-conversations", conversationIds);

        // Update conversation info cache
        conversation.UpdatedTime = DateTime.Now;
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-info", conversation);

        // Update member cache
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-members", members);

        // Update message cache
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-messages", Enumerable.Empty<MessageWithReactions>());
    }

    public async Task AddConversation(string userId, ConversationCacheModel conversation, MemberWithContactInfo[] members, MessageWithReactions message)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? default;
        conversationIds.Insert(0, conversation.Id);
        await _redisCaching.SetAsync($"user-{userId}-conversations", conversationIds);

        // Update conversation info cache
        conversation.LastMessageId = message.Id;
        conversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        conversation.LastMessageTime = message.CreatedTime;
        conversation.LastMessageContact = userId;
        conversation.UpdatedTime = DateTime.Now;
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-info", conversation);

        // Update member cache
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-members", members);

        // Update message cache
        await _redisCaching.SetAsync($"conversation-{conversation.Id}-messages", new List<MessageWithReactions>(1) { message });
    }

    public async Task AddConversation(string userId, string conversationId)
    {
        // Update list conversation cache
        var conversationIds = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? default;
        conversationIds.Insert(0, conversationId);
        await _redisCaching.SetAsync($"user-{userId}-conversations", conversationIds);
    }

    public async Task AddConversation(string[] userIds, string conversationId)
    {
        var tasks = userIds.Select(async userId =>
        {
            // Update list conversation cache
            var conversationIds = await _redisCaching.GetAsync<List<string>>($"user-{userId}-conversations") ?? default;
            conversationIds.Insert(0, conversationId);
            await _redisCaching.SetAsync($"user-{userId}-conversations", conversationIds);
        });
        await Task.WhenAll(tasks);
    }

    public void RemoveAll()
    {
        _ = _redisCaching.DeleteAsync($"user-{UserId}-conversations");
    }
}