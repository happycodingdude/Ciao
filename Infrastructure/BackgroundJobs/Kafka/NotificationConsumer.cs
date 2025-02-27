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
                    var newStoredMemberModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
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
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<MemberWithContactInfo[]>(param.Members);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);
        await _notificationProcessor.Notify(
            "NewMessage",
            param.Conversation.Id,
            user.Id,
            notify);
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);

        // Add to hub
        var members = param.Members.Select(q => q.ContactId).ToList();
        // members.Add(param.UserId);
        var connections = await _userCache.GetUserConnection(members.ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);

        // Push conversation
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<MemberWithContactInfo[]>(param.Members);
        foreach (var member in notify.Members.Where(q => q.Contact.Id != param.UserId))
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }

        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var thisUser = notify.Members.SingleOrDefault(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;
        thisUser.IsNotifying = true;
        thisUser.IsModerator = true;

        _ = _notificationProcessor.Notify(
            "NewConversation",
            param.Conversation.Id,
            user.Id,
            notify
        );
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        if (param.Message is not null)
        {
            var user = await _contactRepository.GetInfoAsync(param.UserId);
            var notify = _mapper.Map<EventNewMessage>(param.Message);
            notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
            notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);
            _ = _notificationProcessor.Notify(
                "NewMessage",
                param.Conversation.Id,
                user.Id,
                notify
            );
        }
    }

    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        // Add to hub
        var members = param.Members.Select(q => q.ContactId).ToList();
        // members.Add(param.UserId);
        var connections = await _userCache.GetUserConnection(members.ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);

        // Push conversation
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<MemberWithContactInfo[]>(param.Members);
        foreach (var member in notify.Members.Where(q => q.Contact.Id != param.UserId))
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }

        var user = await _contactRepository.GetInfoAsync(param.UserId);
        _ = _notificationProcessor.Notify(
            "NewMember",
            param.Conversation.Id,
            user.Id,
            notify
        );
    }
}