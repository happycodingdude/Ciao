namespace SendProcessor.Implementations;

public class KafkaMessageHandler : IKafkaMessageHandler
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly ICaching _caching;
    readonly INotificationMethod _notificationMethod;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;

    public KafkaMessageHandler(IUnitOfWork uow, IMapper mapper, ICaching caching, INotificationMethod notificationMethod, IConversationRepository conversationRepository, IContactRepository contactRepository)
    {
        _uow = uow;
        _mapper = mapper;
        _caching = caching;
        _notificationMethod = notificationMethod;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
    }

    public async Task SaveNewMessage(SaveNewMessageModel param)
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
        foreach (var participant in conversation.Participants.Where(q => q.IsDeleted))
            participant.IsDeleted = false;

        // Update user infor in case changes
        conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.Name = user.Name;
        conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.Avatar = user.Avatar;
        conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.IsOnline = user.IsOnline;

        // Update conversation
        _conversationRepository.Replace(filter, conversation);

        // Save changes
        await _uow.SaveAsync();

        // Update cache
        await _caching.AddNewMessage(param.UserId, conversation.Id, _mapper.Map<MessageWithReactions>(message));

        // Push message            
        var notify = _mapper.Map<MessageToNotify>(message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        _ = _notificationMethod.Notify(
            "NewMessage",
            conversation.Participants
                .Where(q => q.Contact.Id != user.Id)
                .Select(q => q.Contact.Id)
            .ToArray(),
            notify
        );
    }
}