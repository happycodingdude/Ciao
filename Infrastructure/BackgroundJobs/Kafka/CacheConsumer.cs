namespace Infrastructure.BackgroundJobs;

public class CacheConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IMapper _mapper;
    readonly MessageCache _messageCache;
    readonly ConversationCache _conversationCache;
    readonly UserCache _userCache;
    readonly MemberCache _memberCache;
    readonly IContactRepository _contactRepository;

    public CacheConsumer(ILogger logger, IMapper mapper, MessageCache messageCache, ConversationCache conversationCache, UserCache userCache, MemberCache memberCache, IContactRepository contactRepository)
    {
        _logger = logger;
        _mapper = mapper;
        _messageCache = messageCache;
        _conversationCache = conversationCache;
        _userCache = userCache;
        _memberCache = memberCache;
        _contactRepository = contactRepository;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            _logger.Information($"[CacheConsumer] [{param.cr.Topic}] [{param.cr.Message.Value}]");

            switch (param.cr.Topic)
            {
                case Topic.NewStoredMessage:
                    var newStoredMessageModel = JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newStoredMessageModel);
                    break;
                case Topic.NewStoredGroupConversation:
                    var newStoredGroupConversationModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newStoredGroupConversationModel);
                    break;
                case Topic.NewStoredDirectConversation:
                    var newStoredDirectConversationModel = JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newStoredDirectConversationModel);
                    break;
                case Topic.NewStoredMember:
                    var newStoredMemberModel = JsonConvert.DeserializeObject<NewStoredMemberModel>(param.cr.Message.Value);
                    await HandleNewStoredMember(newStoredMemberModel);
                    break;
                default:
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "");
        }
        finally
        {
            // Commit message
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        var message = _mapper.Map<MessageWithReactions>(param.Message);

        await _messageCache.AddMessages(param.UserId, conversationToCache.Id, conversationToCache.UpdatedTime.Value, message);
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
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

        // _logger.Information(JsonConvert.SerializeObject(param.Conversation));
        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        // _logger.Information(JsonConvert.SerializeObject(conversationToCache));
        await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray());

        // Check if any receiver is online then update receiver cache
        var membersToNotify = param.Members.Where(q => q.ContactId != user.Id).Select(q => q.ContactId).ToArray();
        var receivers = await _userCache.GetInfo(membersToNotify);
        if (receivers.Any())
            await _conversationCache.AddConversation(receivers.Select(q => q.Id).ToArray(), param.Conversation.Id);
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
            var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
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

            var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
            if (param.Message is not null)
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray(), _mapper.Map<MessageWithReactions>(param.Message));

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
            else
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray());

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
        }
        else if (param.Message is not null)
        {
            await _messageCache.AddMessages(user.Id, param.Conversation.Id, param.Conversation.UpdatedTime.Value, _mapper.Map<MessageWithReactions>(param.Message));
        }
    }

    async Task HandleNewStoredMember(NewStoredMemberModel param)
    {
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(q => q.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
        foreach (var member in memberToCache)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
        }
        // var friendItems = await _friendRepository.GetFriendItems(MembersToAdd.Select(q => q.ContactId).ToList());
        // for (var i = 0; i < MemberToCache.Count; i++)
        // {
        //     MemberToCache[i].Contact.Name = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Name;
        //     MemberToCache[i].Contact.Avatar = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Avatar;
        //     MemberToCache[i].Contact.Bio = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Bio;
        //     MemberToCache[i].Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).IsOnline;
        //     MemberToCache[i].FriendId = friendItems[i].Item1;
        //     MemberToCache[i].FriendStatus = "friend";
        // }

        await _memberCache.AddMembers(param.ConversationId, memberToCache);
    }
}