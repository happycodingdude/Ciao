namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở ICaching
/// </summary>
public class Caching : ICaching
{
    readonly IDistributedCache _distributedCache;
    readonly IMapper _mapper;

    public Caching(IDistributedCache distributedCache, IMapper mapper)
    {
        _distributedCache = distributedCache;
        _mapper = mapper;
    }

    public async Task UpdateConversation(string userId, List<ConversationWithTotalUnseen> conversations)
    {
        // Add conversation cache
        var conversationsToCache = _mapper.Map<List<ConversationCacheModel>>(conversations);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversationsToCache));
        // Update message cache
        foreach (var conversation in conversations)
            await _distributedCache.SetStringAsync($"conversation-{conversation.Id}-messages", JsonConvert.SerializeObject(conversation.Messages));
    }

    public async Task AddNewConversation(string userId, ConversationCacheModel conversation)
    {
        var ConversationCacheModel = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(ConversationCacheModel) ?? [];
        conversations.Insert(0, conversation);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    }

    public async Task AddNewConversation(string userId, ConversationCacheModel conversation, MessageWithReactions message)
    {
        // Update conversation cache
        var ConversationCacheModel = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(ConversationCacheModel) ?? [];
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

    public async Task AddNewMessage(string userId, string conversationId, MessageWithReactions message)
    {
        // Update conversation cache
        var ConversationCacheModel = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(ConversationCacheModel) ?? [];
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.LastMessageId = message.Id;
        selectedConversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        selectedConversation.LastMessageTime = message.CreatedTime;
        selectedConversation.LastMessageContact = userId;
        // Order by LastMessageTime to pop it up to top
        conversations = conversations.OrderByDescending(q => q.LastMessageTime).ToList();
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));

        // Update message cache
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages");
        var messages = JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache) ?? [];
        messages.Add(message);
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-messages", JsonConvert.SerializeObject(messages));
    }

    public async Task AddNewParticipant(string userId, string conversationId, List<ParticipantWithFriendRequest> participants)
    {
        // Update conversation cache
        var ConversationCacheModel = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        var conversations = JsonConvert.DeserializeObject<List<ConversationCacheModel>>(ConversationCacheModel) ?? [];
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.Participants.AddRange(participants);
        await _distributedCache.SetStringAsync($"user-{userId}-conversations", JsonConvert.SerializeObject(conversations));
    }

    public async Task<List<ConversationCacheModel>> GetConversations(string userId)
    {
        var ConversationCacheModel = await _distributedCache.GetStringAsync($"user-{userId}-conversations");
        return JsonConvert.DeserializeObject<List<ConversationCacheModel>>(ConversationCacheModel);
    }

    public async Task<List<MessageWithReactions>> GetMessages(string conversationId)
    {
        var messageCache = await _distributedCache.GetStringAsync($"conversation-{conversationId}-messages");
        return JsonConvert.DeserializeObject<List<MessageWithReactions>>(messageCache);
    }
}