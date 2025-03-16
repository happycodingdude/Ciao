namespace Infrastructure.BackgroundJobs;

public class DataStoreConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly IKafkaProducer _kafkaProducer;

    public DataStoreConsumer(ILogger logger, IUnitOfWork uow, IMapper mapper, IConversationRepository conversationRepository, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
    {
        _logger = logger;
        _uow = uow;
        _mapper = mapper;
        _conversationRepository = conversationRepository;
        _contactRepository = contactRepository;
        _kafkaProducer = kafkaProducer;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            _logger.Information($"[DataStoreConsumer] [{param.cr.Topic}] [{param.cr.Message.Value}]");

            switch (param.cr.Topic)
            {
                case Topic.NewMessage:
                    var newMessageModel = JsonConvert.DeserializeObject<NewMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newMessageModel);
                    break;
                case Topic.NewGroupConversation:
                    var newGroupConversationModel = JsonConvert.DeserializeObject<NewGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newGroupConversationModel);
                    break;
                case Topic.NewDirectConversation:
                    var newDirectConversationModel = JsonConvert.DeserializeObject<NewDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newDirectConversationModel);
                    break;
                case Topic.NewMember:
                    var newMemberModel = JsonConvert.DeserializeObject<NewMemberModel>(param.cr.Message.Value);
                    await HandleNewMember(newMemberModel);
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

    async Task HandleNewMessage(NewMessageModel param)
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

        await _kafkaProducer.ProduceAsync(Topic.NewStoredMessage, new NewStoredMessageModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = conversation.Members.ToArray(),
            Message = message
        });
    }

    async Task HandleNewGroupConversation(NewGroupConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        conversation.Members = _mapper.Map<List<Member>>(param.Members.ToList());

        // Remove this user from input
        // param.Conversation.Members = param.Conversation.Members.Where(q => q.ContactId != user.Id).ToList();

        // Assign contact info
        foreach (var member in conversation.Members.Where(q => q.ContactId != param.UserId))
        {
            member.IsModerator = false; // Only this user is moderator
            member.IsDeleted = false; // Every members will have this conversation active
            member.IsNotifying = true; // Every members will be notified
        }
        var thisUser = conversation.Members.SingleOrDefault(q => q.ContactId == param.UserId);
        thisUser.IsModerator = true;
        thisUser.IsDeleted = false;
        thisUser.IsNotifying = true;
        // Add this user
        // var user = await _contactRepository.GetInfoAsync(param.UserId);
        // conversation.Members.Add(new Member
        // {
        //     IsModerator = true,
        //     IsDeleted = false,
        //     IsNotifying = true,
        //     ContactId = user.Id
        // });

        // Create conversation
        _conversationRepository.Add(conversation);

        // Save changes
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NewStoredGroupConversation, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = _mapper.Map<NewGroupConversationModel_Member[]>(conversation.Members),
        });
    }

    async Task HandleNewDirectConversation(NewDirectConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);

        // var message = string.IsNullOrEmpty(param.Message)
        //         ? null
        //         : new Message
        //         {
        //             Id = param.MessageId,
        //             ContactId = user.Id,
        //             Type = "text",
        //             Content = param.Message
        //         };

        // var filter = Builders<Conversation>.Filter.And(
        //     Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == user.Id),
        //     Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == param.ContactId),
        //     Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
        // );
        // var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();

        // var isNewConversation = conversation is null;
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        var message = _mapper.Map<Message>(param.Message);
        if (param.IsNewConversation)
            HandleNewConversation(conversation, param.ContactId, param.UserId, message);
        else
            HandleOldConversation(conversation, param.UserId, message);

        // Save changes
        await _uow.SaveAsync();

        // if (param.Message is not null)
        // {
        await _kafkaProducer.ProduceAsync(Topic.NewStoredDirectConversation, new NewStoredDirectConversationModel
        {
            UserId = param.UserId,
            ContactId = param.ContactId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = _mapper.Map<NewGroupConversationModel_Member[]>(conversation.Members),
            Message = message,
            IsNewConversation = param.IsNewConversation
        });
        // }


        void HandleNewConversation(Conversation conversation, string contactId, string userId, Message message)
        {
            // var userId = _contactRepository.GetUserId();

            // var newConversation = new Conversation();
            // Add target contact
            conversation.Members.Add(new Member
            {
                // IsModerator = false,
                // IsDeleted = false,
                IsNotifying = true,
                ContactId = contactId
            });
            // Add this user
            conversation.Members.Add(new Member
            {
                IsModerator = true,
                // IsDeleted = false,
                IsNotifying = true,
                ContactId = userId
            });
            // If send with message -> add new message
            if (message is not null)
                conversation.Messages.Add(message);

            _conversationRepository.Add(conversation);
        }

        void HandleOldConversation(Conversation conversation, string userId, Message message)
        {
            var updateIsDeleted = false;
            var updateMessages = false;
            // var userId = _contactRepository.GetUserId();
            // Update field IsDeleted if true
            var currentUser = conversation.Members.SingleOrDefault(q => q.ContactId == userId);
            if (currentUser.IsDeleted)
            {
                currentUser.IsDeleted = false;
                updateIsDeleted = true;
            }

            // If send with message -> add new message
            if (message is not null)
            {
                conversation.Messages.Add(message);
                updateMessages = true;
            }

            // If processing any updates -> call to update
            if (updateIsDeleted || updateMessages)
            {
                var updateFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
                _conversationRepository.Replace(updateFilter, conversation);
            }
        }
    }

    async Task HandleNewMember(NewMemberModel param)
    {
        // Get current members of conversation, then filter new item to add
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        // Filter new members
        var filterNewItemToAdd = param.Members
            .Select(q => q)
            .ToList()
            .Except(conversation.Members.Select(q => q.ContactId).ToList())
            .ToList();
        // Return if no new partipants
        if (!filterNewItemToAdd.Any()) return;

        var membersNextExecution = _mapper.Map<List<NewGroupConversationModel_Member>>(conversation.Members);

        // Create list new members
        var membersToAdd = new List<Member>(filterNewItemToAdd.Count);
        filterNewItemToAdd.ForEach(q => membersToAdd.Add(
            new Member
            {
                IsModerator = false, // Only this user is moderator
                IsDeleted = false, // Every members will have this conversation active
                IsNotifying = true,
                ContactId = q
            }));
        // Concatenate to existed partipants
        var membersToUpdate = conversation.Members.Concat(membersToAdd);

        // Update to db
        var updates = Builders<Conversation>.Update.Set(q => q.Members, membersToUpdate);
        _conversationRepository.UpdateNoTrackingTime(filter, updates);

        // Save changes
        await _uow.SaveAsync();

        foreach (var memberToAdd in membersToAdd)
        {
            var member = _mapper.Map<NewGroupConversationModel_Member>(memberToAdd);
            member.IsNew = true;
            membersNextExecution.Add(member);
        }
        await _kafkaProducer.ProduceAsync(Topic.NewStoredMember, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = membersNextExecution.ToArray(),
        });
    }
}