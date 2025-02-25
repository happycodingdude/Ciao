using Microsoft.AspNetCore.SignalR;

namespace SendProcessor.Implementations;

public class KafkaMessageHandler : IKafkaMessageHandler
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IFirebaseFunction _firebase;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly MessageCache _messageCache;
    readonly UserCache _userCache;
    readonly INotificationProcessor _notificationProcessor;
    readonly IHubContext<SignalHub> _hubContext;

    public KafkaMessageHandler(IUnitOfWork uow,
        IMapper mapper,
        IFirebaseFunction firebase,
        IConversationRepository conversationRepository,
        IContactRepository contactRepository,
        MessageCache messageCache,
        UserCache userCache,
        INotificationProcessor notificationProcessor,
        IHubContext<SignalHub> hubContext)
    {
        _uow = uow;
        _mapper = mapper;
        _firebase = firebase;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _messageCache = messageCache;
        _userCache = userCache;
        _notificationProcessor = notificationProcessor;
        _hubContext = hubContext;
    }

    public async Task SaveNewMessage(NewMessageModel param)
    {
        // Get current conversation
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        // Prepare message
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var message = _mapper.Map<Message>(param.Message);
        message.ContactId = user.Id;
        if (message.Type == "media")
            message.Content = null;
        conversation.Messages.Add(message);

        // When a message sent, all members of that group will be having that group conversation back
        // if contain any member has deleted the conversation
        foreach (var member in conversation.Members.Where(q => q.IsDeleted))
            member.IsDeleted = false;

        // Update conversation
        _conversationRepository.Replace(filter, conversation);

        // Save changes
        await _uow.SaveAsync();

        // Update cache
        await _messageCache.AddMessages(param.UserId, conversation, _mapper.Map<MessageWithReactions>(message));

        // Push message            
        var notify = _mapper.Map<MessageToNotify>(message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        await _notificationProcessor.Notify(
            "NewMessage",
            conversation.Id,
            user.Id,
            notify);
    }

    public async Task NotifyNewConversation(NewGroupConversationModel param)
    {
        // Add to hub
        var connections = await _userCache.GetUserConnection(param.UserIds);
        foreach (var connection in connections)
        {
            Console.WriteLine($"Add user {connection} to group {param.ConversationId}");
            await _hubContext.Groups.AddToGroupAsync(connection, param.ConversationId);
        }

        // Send notification
        await _notificationProcessor.Notify(
            "NewConversation",
            param.ConversationId,
            param.UserId,
            param.Conversation);
    }
}