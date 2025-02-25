


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
        try
        {
            Console.WriteLine("CacheConsumer receives...");
            Console.WriteLine(JsonConvert.SerializeObject(param.cr.Topic));
            Console.WriteLine(JsonConvert.SerializeObject(param.cr.Message));

            switch (param.cr.Topic)
            {
                case Topic.NewStoredMessage:
                    var newStoredMessageModel = JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newStoredMessageModel);
                    break;
                case Topic.NewStoredGroupConversation:
                    var newStoredGroupConversationModel = JsonConvert.DeserializeObject<NewGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newStoredGroupConversationModel);
                    break;
                case Topic.NewStoredDirectConversation:
                    var newStoredDirectConversationModel = JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newStoredDirectConversationModel);
                    break;
                default:
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(JsonConvert.SerializeObject(ex));
        }
        finally
        {
            // Commit message
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        // Get current conversation
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);
        var message = _mapper.Map<Message>(param.Message);

        await _messageCache.AddMessages(param.UserId, conversation.Id, conversation.UpdatedTime.Value, _mapper.Map<MessageWithReactions>(message));
    }

    async Task HandleNewGroupConversation(NewGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.Contact.Id).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var memberToCache = _mapper.Map<MemberWithContactInfo[]>(param.Members);
        foreach (var member in memberToCache.Where(q => q.Contact.Id != param.UserId))
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;
        thisUser.IsNotifying = true;
        thisUser.IsModerator = true;

        var conversationToCache = _mapper.Map<ConversationCacheModel>(param);
        await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache);

        // Check if any receiver is online then update receiver cache
        var membersToNotify = param.Members.Where(q => q.Contact.Id != user.Id).Select(q => q.Contact.Id).ToArray();
        var receivers = await _userCache.GetInfo(membersToNotify);
        if (receivers.Any())
            await _conversationCache.AddConversation(receivers.Select(q => q.Id).ToArray(), param.Id);
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        // var memberToCache = new List<MemberWithContactInfo>(2);
        // Check if receiver is online then update receiver cache
        var receiver = _userCache.GetInfo(param.ContactId);
        if (param.IsNewConversation)
        {
            // Update cache
            var contactFilter = MongoQuery<Contact>.IdFilter(param.ContactId);
            var contact = await _contactRepository.GetItemAsync(contactFilter);
            var conversationToCache = param.Conversation;
            var memberToCache = param.Members;
            var targetUser = memberToCache.SingleOrDefault(q => q.Contact.Id == param.ContactId);
            targetUser.Contact.Name = contact.Name;
            targetUser.Contact.Avatar = contact.Avatar;
            targetUser.Contact.Bio = contact.Bio;
            targetUser.Contact.IsOnline = contact.IsOnline;
            var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == user.Id);
            thisUser.Contact.Name = user.Name;
            thisUser.Contact.Avatar = user.Avatar;
            thisUser.Contact.Bio = user.Bio;
            thisUser.Contact.IsOnline = true;
            if (param.Message is not null)
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache, _mapper.Map<MessageWithReactions>(param.Message));

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
            else
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache);

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
        }
        else if (param.Message is not null)
        {
            await _messageCache.AddMessages(user.Id, param.Conversation.Id, param.Conversation.UpdatedTime.Value, _mapper.Map<MessageWithReactions>(param.Message));
        }
    }
}