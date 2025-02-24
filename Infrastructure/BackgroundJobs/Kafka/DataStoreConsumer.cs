namespace Infrastructure.BackgroundJobs;

public class DataStoreConsumer : IGenericConsumer
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;

    public DataStoreConsumer(IUnitOfWork uow, IMapper mapper, IConversationRepository conversationRepository, IContactRepository contactRepository)
    {
        _uow = uow;
        _mapper = mapper;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        Console.WriteLine("DataStoreConsumer receives...");
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
    }

    async Task HandleNewConversation(NotifyNewConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param.Conversation);

        // Remove this user from input
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        conversation.Members = conversation.Members.Where(q => q.ContactId != user.Id).ToList();

        // Assign contact info
        foreach (var member in conversation.Members)
        {
            member.IsModerator = false; // Only this user is moderator
            member.IsDeleted = false; // Every members will have this conversation active
            member.IsNotifying = true; // Every members will be notified
        }
        // Add this user
        conversation.Members.Add(new Member
        {
            IsModerator = true,
            IsDeleted = false,
            IsNotifying = true,
            ContactId = user.Id
        });

        // Create conversation
        _conversationRepository.Add(conversation);
    }
}