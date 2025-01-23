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
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations");
        return JsonConvert.DeserializeObject<List<ConversationCacheModel>>(conversationCacheData);
    }

    public async Task SetConversations(string userId, List<ConversationWithTotalUnseen> conversations)
    {
        // Add conversation cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationsToCache));
        // Update message cache
        foreach (var conversation in conversations)
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(conversation.Messages));
    }

    public async Task SetConversation(string userId, ConversationCacheModel conversation)
    {
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(conversationCacheData) ?? [];
        conversations.Insert(0, conversation);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    }

    public async Task SetConversation(string userId, ConversationCacheModel conversation, MessageWithReactions message)
    {
        // Update conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(conversationCacheData) ?? [];
        conversation.LastMessageId = message.Id;
        conversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        conversation.LastMessageTime = message.CreatedTime;
        conversation.LastMessageContact = userId;
        conversations.Insert(0, conversation);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
        // Update message cache
        await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(new List<MessageWithReactions>(1) { message }));
    }

    public async Task SetParticipants(string userId, string conversationId, List<ParticipantWithFriendRequest> participants)
    {
        // Update conversation cache
        var conversationCacheData = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(conversationCacheData) ?? [];
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.Participants.AddRange(participants);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    }

    public void RemoveAll()
    {
        _distributedCache.Remove($"user-{UserId}-conversations");
    }
}