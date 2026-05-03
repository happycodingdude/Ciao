namespace Infrastructure.BackgroundJobs;

public class NotificationConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IMapper _mapper;
    readonly UserCache _userCache;
    readonly MemberCache _memberCache;
    readonly IContactRepository _contactRepository;
    readonly IFirebaseFunction _firebaseFunction;

    public NotificationConsumer(ILogger logger, IMapper mapper, UserCache userCache, MemberCache memberCache, IContactRepository contactRepository, IFirebaseFunction firebaseFunction)
    {
        _logger = logger;
        _mapper = mapper;
        _userCache = userCache;
        _memberCache = memberCache;
        _contactRepository = contactRepository;
        _firebaseFunction = firebaseFunction;
    }

    public async Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.Information("[{Consumer}] [{Topic}] {Message}", nameof(NotificationConsumer), param.cr.Topic, param.cr.Message.Value);

            switch (param.cr.Topic)
            {
                case Topic.StoredMessage:
                    await HandleNewMessage(JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredGroupConversation:
                    await HandleNewGroupConversation(JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredDirectConversation:
                    await HandleNewDirectConversation(JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredMember:
                    await HandleNewStoredMember(JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyNewReaction:
                    await HandleNewReaction(JsonConvert.DeserializeObject<NotifyNewReactionModel>(param.cr.Message.Value)!);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(NotificationConsumer), param.cr.Topic);
        }
        finally
        {
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(await _userCache.GetInfo(param.UserId));
        notify.Content = notify.Type == "text" ? notify.Content : null;
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(
            param.Members.Where(q => q.ContactId != param.UserId).ToArray());

        var memberIds = notify.Members.Select(m => m.Contact.Id).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            Builders<Contact>.Filter.Where(q => memberIds.Contains(q.Id)));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
                member.Contact = _mapper.Map<ContactInfoMoreDetails>(contact);
            member.IsNotifying = true;
        }

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            notify.Members.Select(q => q.Contact.Id).ToArray(),
            notify);
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(
            param.Members.Where(q => q.ContactId != param.UserId).ToArray());

        var memberIds = param.Members.Select(m => m.ContactId).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
            {
                member.Contact.Name = contact.Name;
                member.Contact.Avatar = contact.Avatar;
                member.Contact.Bio = contact.Bio;
                member.Contact.IsOnline = contact.IsOnline;
            }
            member.IsNotifying = true;
        }

        await _firebaseFunction.Notify(
            ChatEventNames.NewConversation,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify);
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);
        var user = await _userCache.GetInfo(param.UserId);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);

        var contact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(param.ContactId));

        var targetUser = notify.Members.Single(q => q.Contact.Id == param.ContactId);
        targetUser.Contact.Name = contact.Name;
        targetUser.Contact.Avatar = contact.Avatar;
        targetUser.Contact.Bio = contact.Bio;
        targetUser.Contact.IsOnline = contact.IsOnline;

        var thisUser = notify.Members.Single(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            new[] { param.ContactId },
            notify);
    }

    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        var memberIds = notify.Members.Select(m => m.Contact.Id).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
            {
                member.Contact.Name = contact.Name;
                member.Contact.Avatar = contact.Avatar;
                member.Contact.Bio = contact.Bio;
                member.Contact.IsOnline = contact.IsOnline;
            }
            member.IsNotifying = true;
        }

        await _firebaseFunction.Notify(
            ChatEventNames.NewMembers,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify);
    }

    async Task HandleNewReaction(NotifyNewReactionModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);

        await _firebaseFunction.Notify(
            ChatEventNames.NewReaction,
            members.Select(q => q.Contact.Id).ToArray(),
            param);
    }
}
