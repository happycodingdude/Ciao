namespace Infrastructure.BackgroundJobs;

public class NotificationConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IMapper _mapper;
    readonly UserCache _userCache;
    readonly IContactRepository _contactRepository;
    readonly INotificationProcessor _notificationProcessor;
    readonly IHubContext<SignalHub> _hubContext;

    public NotificationConsumer(ILogger logger, IMapper mapper, UserCache userCache, IContactRepository contactRepository, INotificationProcessor notificationProcessor, IHubContext<SignalHub> hubContext)
    {
        _logger = logger;
        _mapper = mapper;
        _userCache = userCache;
        _contactRepository = contactRepository;
        _notificationProcessor = notificationProcessor;
        _hubContext = hubContext;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            _logger.Information($"[NotificationConsumer] [{param.cr.Topic}] [{param.cr.Message.Value}]");

            switch (param.cr.Topic)
            {
                case Topic.StoredMessage:
                    var newStoredMessageModel = JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newStoredMessageModel);
                    break;
                case Topic.StoredGroupConversation:
                    var newStoredGroupConversationModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newStoredGroupConversationModel);
                    break;
                case Topic.StoredDirectConversation:
                    var newStoredDirectConversationModel = JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newStoredDirectConversationModel);
                    break;
                case Topic.StoredMember:
                    var newStoredMemberModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewStoredMember(newStoredMemberModel);
                    break;
                case Topic.NotifyNewReaction:
                    var newReactionModel = JsonConvert.DeserializeObject<NotifyNewReactionModel>(param.cr.Message.Value);
                    await HandleNewReaction(newReactionModel);
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
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Content = notify.Type == "text" ? notify.Content : null;
        // : string.Join(",", notify.Attachments.Select(q => q.MediaName));
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        var contactFilter = Builders<Contact>.Filter.Where(q => notify.Members.Select(w => w.Contact.Id).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        // foreach (var member in notify.Members.Where(q => q.Contact.Id != param.UserId))
        foreach (var member in notify.Members)
        {
            var contact = contacts.SingleOrDefault(q => q.Id == member.Contact.Id);
            member.Contact = _mapper.Map<ContactInfoMoreDetails>(contact);
            member.IsNotifying = true;
        }

        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);
        await _notificationProcessor.Notify(
            ChatEventNames.NewMessage,
            param.Conversation.Id,
            user.Id,
            notify);
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);

        // Add to hub
        var members = param.Members.Select(q => q.ContactId).ToList();
        var connections = await _userCache.GetUserConnection(members.ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);

        // Push conversation
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        // foreach (var member in notify.Members.Where(q => q.Contact.Id != param.UserId))
        foreach (var member in notify.Members)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }

        // var user = await _contactRepository.GetInfoAsync(param.UserId);
        // var thisUser = notify.Members.SingleOrDefault(q => q.Contact.Id == param.UserId);
        // thisUser.Contact.Name = user.Name;
        // thisUser.Contact.Avatar = user.Avatar;
        // thisUser.Contact.Bio = user.Bio;
        // thisUser.Contact.IsOnline = true;
        // thisUser.IsNotifying = true;
        // thisUser.IsModerator = true;

        _ = _notificationProcessor.Notify(
            ChatEventNames.NewConversation,
            param.Conversation.Id,
            param.UserId,
            notify
        );
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        if (param.IsNewConversation)
        {
            // Add to hub
            var members = param.Members.Select(q => q.ContactId).ToList();
            var connections = await _userCache.GetUserConnection(members.ToArray());
            foreach (var connection in connections)
                await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);
        }

        if (param.Message is null) return;

        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);

        var member = notify.Members.SingleOrDefault(q => q.Contact.Id != param.UserId);
        var contact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(member.Contact.Id));
        member.Contact.Name = contact.Name;
        member.Contact.Avatar = contact.Avatar;
        member.Contact.Bio = contact.Bio;
        member.Contact.IsOnline = contact.IsOnline;

        var thisUser = notify.Members.SingleOrDefault(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;

        _ = _notificationProcessor.Notify(
            ChatEventNames.NewMessage,
            param.Conversation.Id,
            user.Id,
            notify
        );
    }

    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        // Add to hub
        var members = param.Members.Select(q => q.ContactId).ToList();
        var connections = await _userCache.GetUserConnection(members.ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);

        // Push conversation
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        // foreach (var member in notify.Members.Where(q => q.Contact.Id != param.UserId))
        foreach (var member in notify.Members)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }

        // var user = await _contactRepository.GetInfoAsync(param.UserId);
        _ = _notificationProcessor.Notify(
            ChatEventNames.NewMembers,
            param.Conversation.Id,
            param.UserId,
            notify
        );
    }

    async Task HandleNewReaction(NotifyNewReactionModel param)
    {
        _ = _notificationProcessor.Notify(
            ChatEventNames.NewReaction,
            param.ConversationId,
            param.UserId,
            param
        );
    }
}