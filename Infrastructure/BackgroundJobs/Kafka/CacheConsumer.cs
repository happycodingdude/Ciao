


namespace Infrastructure.BackgroundJobs;

public class CacheConsumer : IGenericConsumer
{
    readonly IMapper _mapper;
    readonly MessageCache _messageCache;
    readonly ConversationCache _conversationCache;
    readonly UserCache _userCache;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;

    public CacheConsumer(IMapper mapper, MessageCache messageCache, ConversationCache conversationCache, UserCache userCache, IConversationRepository conversationRepository, IContactRepository contactRepository)
    {
        _mapper = mapper;
        _messageCache = messageCache;
        _conversationCache = conversationCache;
        _userCache = userCache;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        Console.WriteLine("CacheConsumer receives...");
        Console.WriteLine(JsonConvert.SerializeObject(param.cr.Topic));
        Console.WriteLine(JsonConvert.SerializeObject(param.cr.Message));

        switch (param.cr.Topic)
        {
            case Topic.NewMessage:
                var saveNewMessageModel = JsonConvert.DeserializeObject<SaveNewMessageModel>(param.cr.Message.Value);
                await HandleNewMessage(saveNewMessageModel);
                break;
            case Topic.NewConversation:
                var notifyNewConversationModel = JsonConvert.DeserializeObject<NotifyNewConversationModel>(param.cr.Message.Value);
                await HandleNewConversation(notifyNewConversationModel);
                break;
            default:
                break;
        }

        // Commit message
        param.consumer.Commit(param.cr);
    }

    async Task HandleNewMessage(SaveNewMessageModel param)
    {
        // Get current conversation
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);
        var message = _mapper.Map<Message>(param.Message);

        await _messageCache.AddMessages(param.UserId, conversation, _mapper.Map<MessageWithReactions>(message));
    }

    async Task HandleNewConversation(NotifyNewConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        var contactFilter = Builders<Contact>.Filter.Where(q => conversation.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);
        var conversationToCache = _mapper.Map<ConversationCacheModel>(conversation);
        var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(conversation.Members);

        var user = await _contactRepository.GetInfoAsync(param.UserId);
        foreach (var member in memberToCache.Where(q => q.Contact.Id != user.Id))
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
        }
        var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == user.Id);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;
        await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache);

        // Check if any receiver is online then update receiver cache
        var membersToNotify = conversation.Members.Where(q => q.ContactId != user.Id).Select(q => q.ContactId).ToArray();
        var receivers = await _userCache.GetInfo(membersToNotify);
        if (receivers.Any())
            await _conversationCache.AddConversation(receivers.Select(q => q.Id).ToArray(), conversation.Id);
    }
}