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

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            _logger.Information($"[NotificationConsumer] [{param.cr.Topic}] {param.cr.Message.Value}");

            switch (param.cr.Topic)
            {
                case Topic.StoredMessage:
                    var newStoredMessageModel = JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newStoredMessageModel!);
                    break;
                case Topic.StoredGroupConversation:
                    var newStoredGroupConversationModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newStoredGroupConversationModel!);
                    break;
                case Topic.StoredDirectConversation:
                    var newStoredDirectConversationModel = JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newStoredDirectConversationModel!);
                    break;
                case Topic.StoredMember:
                    var newStoredMemberModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewStoredMember(newStoredMemberModel!);
                    break;
                case Topic.NotifyNewReaction:
                    var newReactionModel = JsonConvert.DeserializeObject<NotifyNewReactionModel>(param.cr.Message.Value);
                    await HandleNewReaction(newReactionModel!);
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

    /* MARK: NEW MESSAGE */
    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        // Prepare notification
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(await _userCache.GetInfo(param.UserId));
        notify.Content = notify.Type == "text" ? notify.Content : null;
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        // Don't notify sender
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members.Where(q => q.ContactId != param.UserId).ToArray());

        // Get member details
        var contactFilter = Builders<Contact>.Filter.Where(q => notify.Members.Select(w => w.Contact.Id).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);
        foreach (var member in notify.Members)
        {
            var contact = contacts.SingleOrDefault(q => q.Id == member.Contact.Id);
            member.Contact = _mapper.Map<ContactInfoMoreDetails>(contact);
            member.IsNotifying = true;
        }

        // await _notificationProcessor.Notify(
        //     ChatEventNames.NewMessage,
        //     param.Conversation.Id,
        //     // param.Message.Id,
        //     user.Id,
        //     notify);

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            notify.Members.Select(q => q.Contact.Id).ToArray(),
            notify
        );
    }

    /* MARK: NEW GROUP CONVERSATION */
    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        // Prepare notification
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        // Don't notify sender
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members.Where(q => q.ContactId != param.UserId).ToArray());

        // Don't notify sender
        notify.Members = notify.Members.Where(q => q.Contact.Id != param.UserId).ToArray();

        // Get member details
        // var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contactFilter = MongoQuery<Contact>.ContactIdFilter(param.Members.Select(w => w.ContactId).ToArray());
        var contacts = await _contactRepository.GetAllAsync(contactFilter);
        foreach (var member in notify.Members)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Name!;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Avatar!;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Bio!;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.IsOnline! ?? false;
            member.IsNotifying = true;
        }

        // Add to hub
        // var members = param.Members.Select(q => q.ContactId).ToList();
        // var connections = await _userCache.GetUserConnection(members.ToArray());
        // foreach (var connection in connections)
        // {
        //     Console.WriteLine($"Add connection {connection} to conversation {param.Conversation.Id}");
        //     await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);
        // }

        // _ = _notificationProcessor.Notify(
        //     ChatEventNames.NewConversation,
        //     param.Conversation.Id,
        //     param.UserId,
        //     notify
        // );

        await _firebaseFunction.Notify(
            ChatEventNames.NewConversation,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify
        );
    }

    /* MARK: NEW DIRECT CONVERSATION */
    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        // if (param.IsNewConversation)
        // {
        //     // Add to hub
        //     var members = param.Members.Select(q => q.ContactId).ToList();
        //     var connections = await _userCache.GetUserConnection(members.ToArray());
        //     foreach (var connection in connections)
        //         await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);
        // }

        // if (param.Message is null) return;

        // Prepare notification
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);
        var user = await _userCache.GetInfo(param.UserId);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);

        // Get member details
        var contactFilter = MongoQuery<Contact>.IdFilter(param.ContactId);
        var contact = await _contactRepository.GetItemAsync(contactFilter);

        var targetUser = notify.Members.SingleOrDefault(q => q.Contact.Id == param.ContactId);
        targetUser!.Contact.Name = contact.Name;
        targetUser.Contact.Avatar = contact.Avatar;
        targetUser.Contact.Bio = contact.Bio;
        targetUser.Contact.IsOnline = contact.IsOnline;

        var thisUser = notify.Members.SingleOrDefault(q => q.Contact.Id == param.UserId);
        thisUser!.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;

        // _ = _notificationProcessor.Notify(
        //     ChatEventNames.NewMessage,
        //     param.Conversation.Id,
        //     user.Id,
        //     notify
        // );

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            new string[1] { param.ContactId },
            notify
        );
    }

    /* MARK: NEW MEMBERS */
    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        // Add to hub
        // var members = param.Members.Select(q => q.ContactId).ToList();
        // var connections = await _userCache.GetUserConnection(members.ToArray());
        // foreach (var connection in connections)
        //     await _hubContext.Groups.AddToGroupAsync(connection, param.Conversation.Id);

        // Prepare notification
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        // Get member details
        var contactFilter = MongoQuery<Contact>.ContactIdFilter(notify.Members.Select(w => w.Contact.Id).ToArray());
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        foreach (var member in notify.Members)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Name!;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Avatar!;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.Bio!;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id)?.IsOnline ?? false;
            member.IsNotifying = true;
        }

        await _firebaseFunction.Notify(
            ChatEventNames.NewMembers,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify
        );

        // var user = await _contactRepository.GetInfoAsync(param.UserId);
        // _ = _notificationProcessor.Notify(
        //     ChatEventNames.NewMembers,
        //     param.Conversation.Id,
        //     param.UserId,
        //     notify
        // );
    }

    /* MARK: NEW REACTION */
    async Task HandleNewReaction(NotifyNewReactionModel param)
    {
        // Get all members in conversation except reactor
        var members = await _memberCache.GetMembers(param.ConversationId);

        await _firebaseFunction.Notify(
            ChatEventNames.NewReaction,
            members.Select(q => q.Contact.Id).ToArray(),
            param
        );

        // _ = _notificationProcessor.Notify(
        //     ChatEventNames.NewReaction,
        //     param.ConversationId,
        //     param.UserId,
        //     param
        // );
    }
}