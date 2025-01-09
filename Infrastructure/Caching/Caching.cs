
namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở ICaching
/// </summary>
public class Caching : ICaching
{
    readonly IDistributedCache _distributedCache;
    readonly IContactRepository _contactRepository;

    public Caching(IDistributedCache distributedCache, IContactRepository contactRepository)
    {
        _distributedCache = distributedCache;
        _contactRepository = contactRepository;
    }

    public async Task UpdateConversation(IEnumerable<ConversationWithTotalUnseen> conversations)
    {
        var userId = _contactRepository.GetUserId();
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }

    public async Task AddNewConversation(ConversationWithTotalUnseen conversation)
    {
        var userId = _contactRepository.GetUserId();
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

    public async Task AddNewMessage(string conversationId, MessageWithReactions message)
    {
        var userId = _contactRepository.GetUserId();
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
        await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));
    }
}