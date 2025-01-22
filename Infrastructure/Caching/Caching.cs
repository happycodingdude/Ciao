

namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở ICaching
/// </summary>
public class Caching : ICaching
{
    readonly IDistributedCache _distributedCache;

    public Caching(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task UpdateConversation(string userId, IEnumerable<ConversationWithTotalUnseen> conversations)
    {
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }

    public async Task AddNewConversation(string userId, ConversationWithTotalUnseen conversation)
    {
        var cachedData = await _distributedCache.GetStringAsync($"conversations-{userId}");
        var conversations = JsonConvert.DeserializeObject<List<ConversationWithTotalUnseen>>(cachedData);
        if (conversation.Messages.Any())
        {
            conversation.LastMessageId = conversation.Messages.LastOrDefault().Id;
            conversation.LastMessage = conversation.Messages.LastOrDefault().Type == "text"
                ? conversation.Messages.Last().Content
                : string.Join(",", conversation.Messages.LastOrDefault().Attachments.Select(q => q.MediaName));
            conversation.LastMessageTime = conversation.Messages.LastOrDefault().CreatedTime;
            conversation.LastMessageContact = userId;
        }
        conversations.Insert(0, conversation);
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }

    public async Task AddNewMessage(string userId, string conversationId, MessageWithReactions message)
    {
        var cachedData = await _distributedCache.GetStringAsync($"conversations-{userId}");
        var conversations = JsonConvert.DeserializeObject<IEnumerable<ConversationWithTotalUnseen>>(cachedData);
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.LastMessageId = message.Id;
        selectedConversation.LastMessage = message.Type == "text"
            ? message.Content
            : string.Join(",", message.Attachments.Select(q => q.MediaName));
        selectedConversation.LastMessageTime = message.CreatedTime;
        selectedConversation.LastMessageContact = userId;
        selectedConversation.Messages.Add(message);
        conversations = conversations.OrderByDescending(q => q.LastMessageTime);
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }

    public async Task AddNewParticipant(string userId, string conversationId, List<ParticipantWithFriendRequest> participants)
    {
        var cachedData = await _distributedCache.GetStringAsync($"conversations-{userId}");
        var conversations = JsonConvert.DeserializeObject<IEnumerable<ConversationWithTotalUnseen>>(cachedData);
        var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversationId);
        selectedConversation.Participants.AddRange(participants);
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }
}