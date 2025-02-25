
namespace Infrastructure.BackgroundJobs;

public class NotificationConsumer : IGenericConsumer
{
    readonly IMapper _mapper;
    readonly UserCache _userCache;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly INotificationProcessor _notificationProcessor;
    readonly IHubContext<SignalHub> _hubContext;

    public NotificationConsumer(IMapper mapper, UserCache userCache, IConversationRepository conversationRepository, IContactRepository contactRepository, INotificationProcessor notificationProcessor, IHubContext<SignalHub> hubContext)
    {
        _mapper = mapper;
        _userCache = userCache;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _notificationProcessor = notificationProcessor;
        _hubContext = hubContext;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            Console.WriteLine("NotificationConsumer receives...");
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
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);
        // var message = _mapper.Map<Message>(param.Message);

        var notify = _mapper.Map<MessageToNotify>(param.Message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        await _notificationProcessor.Notify(
            "NewMessage",
            conversation.Id,
            user.Id,
            notify);
    }

    async Task HandleNewGroupConversation(NewGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);

        // Add to hub
        var members = param.Members.Select(q => q.Contact.Id).ToList();
        // members.Add(param.UserId);
        var connections = await _userCache.GetUserConnection(members.ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, param.Id);

        // Push conversation
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.Contact.Id).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var notify = _mapper.Map<ConversationToNotify>(param);
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
            param.Id,
            user.Id,
            notify
        );
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        if (param.Message is not null)
        {
            var user = await _contactRepository.GetInfoAsync(param.UserId);
            var notify = _mapper.Map<MessageToNotify>(param.Message);
            notify.Conversation = _mapper.Map<ConversationToNotify>(param.Conversation);
            // notify.Conversation.Members = memberToCache;
            notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
            _ = _notificationProcessor.Notify(
                "NewMessage",
                param.Conversation.Id,
                user.Id,
                notify
            );
        }
    }
}