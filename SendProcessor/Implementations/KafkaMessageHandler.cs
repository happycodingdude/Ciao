namespace SendProcessor.Implementations;

public class KafkaMessageHandler : IKafkaMessageHandler
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IFirebaseFunction _firebase;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly MessageCache _messageCache;

    public KafkaMessageHandler(IUnitOfWork uow,
        IMapper mapper,
        IFirebaseFunction firebase,
        IConversationRepository conversationRepository,
        IContactRepository contactRepository,
        MessageCache messageCache)
    {
        _uow = uow;
        _mapper = mapper;
        _firebase = firebase;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _messageCache = messageCache;
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
        await _messageCache.SetMessages(param.UserId, conversation.Id, _mapper.Map<MessageWithReactions>(message));

        // Push message            
        var notify = _mapper.Map<MessageToNotify>(message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        _ = _firebase.Notify(
            "NewMessage",
            conversation.Participants
                .Where(q => q.Contact.Id != user.Id)
                .Select(q => q.Contact.Id)
            .ToArray(),
            notify
        );
    }
}