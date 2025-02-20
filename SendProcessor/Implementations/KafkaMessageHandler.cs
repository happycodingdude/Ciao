namespace SendProcessor.Implementations;

public class KafkaMessageHandler : IKafkaMessageHandler
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IFirebaseFunction _firebase;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly MessageCache _messageCache;
    readonly ConversationCache _conversationCache;
    readonly ISignalHub _signalHub;

    public KafkaMessageHandler(IUnitOfWork uow,
        IMapper mapper,
        IFirebaseFunction firebase,
        IConversationRepository conversationRepository,
        IContactRepository contactRepository,
        MessageCache messageCache,
        ConversationCache conversationCache,
        ISignalHub signalHub)
    {
        _uow = uow;
        _mapper = mapper;
        _firebase = firebase;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _messageCache = messageCache;
        _conversationCache = conversationCache;
        _signalHub = signalHub;
    }

    public async Task SaveNewMessage(SaveNewMessageModel param)
    {
        // Get current conversation
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        // Prepare message
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        // Console.WriteLine(JsonConvert.SerializeObject(param.Message));
        var message = _mapper.Map<Message>(param.Message);
        message.ContactId = user.Id;
        if (message.Type == "media")
            message.Content = null;
        // Console.WriteLine(JsonConvert.SerializeObject(message));
        conversation.Messages.Add(message);

        // When a message sent, all members of that group will be having that group conversation back
        // if contain any member has deleted the conversation
        foreach (var member in conversation.Members.Where(q => q.IsDeleted))
            member.IsDeleted = false;

        // Update user info in case changes
        // conversation.Members.SingleOrDefault(q => q.ContactId == user.Id).Contact.Name = user.Name;
        // conversation.Members.SingleOrDefault(q => q.ContactId == user.Id).Contact.Avatar = user.Avatar;
        // conversation.Members.SingleOrDefault(q => q.ContactId == user.Id).Contact.IsOnline = user.IsOnline;

        // Update conversation
        // Console.WriteLine(JsonConvert.SerializeObject(conversation));
        _conversationRepository.Replace(filter, conversation);

        // Save changes
        await _uow.SaveAsync();

        // Update cache
        await _messageCache.AddMessages(param.UserId, conversation, _mapper.Map<MessageWithReactions>(message));

        // Push message            
        var notify = _mapper.Map<MessageToNotify>(message);
        notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
        notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
        // _ = _firebase.Notify(
        //     "NewMessage",
        //     conversation.Members
        //         .Where(q => q.ContactId != user.Id)
        //         .Select(q => q.ContactId)
        //     .ToArray(),
        //     notify
        // );
        _ = _signalHub.Notify(
            "NewMessage",
            conversation.Members
                .Where(q => q.ContactId != user.Id)
                .Select(q => q.ContactId)
            .ToArray(),
            notify);
    }

    // public async Task UpdateConversationCache(UpdateConversationCacheModel param)
    // {
    //     await _conversationCache.SetConversations(param.UserId, param.Conversations);
    // }
}