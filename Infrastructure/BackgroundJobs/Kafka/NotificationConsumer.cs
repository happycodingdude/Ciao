
namespace Infrastructure.BackgroundJobs;

public class NotificationConsumer : IGenericConsumer
{
    readonly IMapper _mapper;
    readonly MessageCache _messageCache;
    readonly ConversationCache _conversationCache;
    readonly UserCache _userCache;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly INotificationProcessor _notificationProcessor;
    readonly IHubContext<SignalHub> _hubContext;

    public NotificationConsumer(IMapper mapper, IConversationRepository conversationRepository, IContactRepository contactRepository, INotificationProcessor notificationProcessor)
    {
        _mapper = mapper;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _notificationProcessor = notificationProcessor;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        Console.WriteLine("NotificationConsumer receives...");
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
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);
        var message = _mapper.Map<Message>(param.Message);

        var notify = _mapper.Map<MessageToNotify>(message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        await _notificationProcessor.Notify(
            "NewMessage",
            conversation.Id,
            user.Id,
            notify);
    }

    async Task HandleNewConversation(NotifyNewConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        var memberToNotify = _mapper.Map<List<MemberWithContactInfo>>(conversation.Members);

        // Add to hub
        var connections = await _userCache.GetUserConnection(memberToNotify.Select(q => q.Contact.Id).ToArray());
        foreach (var connection in connections)
            await _hubContext.Groups.AddToGroupAsync(connection, conversation.Id);

        // Push conversation
        var notify = _mapper.Map<ConversationToNotify>(conversation);
        _ = _notificationProcessor.Notify(
            "NewConversation",
            user.Id,
            conversation.Id,
            notify
        );
    }
}