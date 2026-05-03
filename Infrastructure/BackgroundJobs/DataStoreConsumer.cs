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

    public async Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.Information("[{Consumer}] [{Topic}] {Message}", nameof(DataStoreConsumer), param.cr.Topic, param.cr.Message.Value);

            switch (param.cr.Topic)
            {
                case Topic.NewMessage:
                    await HandleNewMessage(JsonConvert.DeserializeObject<NewMessageModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NewGroupConversation:
                    await HandleNewGroupConversation(JsonConvert.DeserializeObject<NewGroupConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NewDirectConversation:
                    await HandleNewDirectConversation(JsonConvert.DeserializeObject<NewDirectConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NewMember:
                    await HandleNewMember(JsonConvert.DeserializeObject<NewMemberModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NewReaction:
                    await HandleNewReaction(JsonConvert.DeserializeObject<NewReactionModel>(param.cr.Message.Value)!);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(DataStoreConsumer), param.cr.Topic);
        }
        finally
        {
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleNewMessage(NewMessageModel param)
    {
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        var message = _mapper.Map<Message>(param.Message);
        message.ContactId = param.UserId;
        if (message.Type == "media") message.Content = default!;
        conversation.Messages.Add(message);

        foreach (var member in conversation.Members.Where(q => q.IsDeleted))
            member.IsDeleted = false;

        _conversationRepository.Replace(filter, conversation);
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.StoredMessage, new NewStoredMessageModel
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

        foreach (var member in conversation.Members.Where(q => q.ContactId != param.UserId))
        {
            member.IsModerator = false;
            member.IsDeleted = false;
            member.IsNotifying = true;
        }
        var thisUser = conversation.Members.Single(q => q.ContactId == param.UserId);
        thisUser.IsModerator = true;
        thisUser.IsDeleted = false;
        thisUser.IsNotifying = true;

        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var systemMessage = new SystemMessage(AppConstants.SystemMessage_CreatedConversation.Replace("{user}", user?.Name));
        var messageToAdd = _mapper.Map<Message>(systemMessage);
        conversation.Messages.Add(messageToAdd);

        _conversationRepository.Add(conversation);
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.StoredGroupConversation, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = _mapper.Map<NewGroupConversationModel_Member[]>(conversation.Members),
            Message = messageToAdd
        });
    }

    async Task HandleNewDirectConversation(NewDirectConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        var message = _mapper.Map<Message>(param.Message);
        if (param.IsNewConversation)
            HandleNewConversation(conversation, param.ContactId, param.UserId, message);
        else
            HandleOldConversation(conversation, param.UserId, message);

        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.StoredDirectConversation, new NewStoredDirectConversationModel
        {
            UserId = param.UserId,
            ContactId = param.ContactId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = _mapper.Map<NewGroupConversationModel_Member[]>(conversation.Members),
            Message = message,
            IsNewConversation = param.IsNewConversation
        });

        void HandleNewConversation(Conversation conversation, string contactId, string userId, Message message)
        {
            conversation.Members.Add(new Member { IsNotifying = true, ContactId = contactId });
            conversation.Members.Add(new Member { IsModerator = true, IsNotifying = true, ContactId = userId });
            if (message is not null)
                conversation.Messages.Add(message);
            _conversationRepository.Add(conversation);
        }

        void HandleOldConversation(Conversation conversation, string userId, Message message)
        {
            var updateIsDeleted = false;
            var updateMessages = false;

            var currentUser = conversation.Members.Single(q => q.ContactId == userId);
            if (currentUser.IsDeleted)
            {
                currentUser.IsDeleted = false;
                updateIsDeleted = true;
            }

            if (message is not null)
            {
                conversation.Messages.Add(message);
                updateMessages = true;
            }

            if (updateIsDeleted || updateMessages)
                _conversationRepository.Replace(MongoQuery<Conversation>.IdFilter(conversation.Id), conversation);
        }
    }

    async Task HandleNewMember(NewMemberModel param)
    {
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        var existingMemberIds = conversation.Members.Select(q => q.ContactId).ToHashSet();
        var newMemberIds = param.Members.Where(id => !existingMemberIds.Contains(id)).ToList();
        if (!newMemberIds.Any()) return;

        var membersToAdd = newMemberIds.Select(id => new Member
        {
            IsModerator = false,
            IsDeleted = false,
            IsNotifying = true,
            ContactId = id
        }).ToList();

        var membersToUpdate = conversation.Members.Concat(membersToAdd);

        var contactFilter = Builders<Contact>.Filter.Where(q =>
            membersToAdd.Select(m => m.ContactId).Contains(q.Id) || q.Id == param.UserId);
        var contacts = await _contactRepository.GetAllAsync(contactFilter);
        var contactMap = contacts.ToDictionary(c => c.Id);

        var systemMessage = new SystemMessage(
            AppConstants.SystemMessage_AddedMembers
                .Replace("{user}", contactMap.GetValueOrDefault(param.UserId)?.Name)
                .Replace("{members}", string.Join(", ", membersToAdd.Select(m => contactMap.GetValueOrDefault(m.ContactId)?.Name)))
        );
        var messageToAdd = _mapper.Map<Message>(systemMessage);
        conversation.Messages.Add(messageToAdd);

        var updates = Builders<Conversation>.Update
            .Set(q => q.Members, membersToUpdate)
            .Set(q => q.Messages, conversation.Messages);
        _conversationRepository.UpdateNoTrackingTime(filter, updates);
        await _uow.SaveAsync();

        var storedMembers = newMemberIds.Select(id => new NewGroupConversationModel_Member
        {
            ContactId = id,
            IsNew = true
        }).ToArray();

        await _kafkaProducer.ProduceAsync(Topic.StoredMember, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = storedMembers,
            Message = messageToAdd
        });
    }

    async Task HandleNewReaction(NewReactionModel param)
    {
        // Initialize Reactions array if null/empty
        var initFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages,
                w => w.Id == param.MessageId && (w.Reactions == null || !w.Reactions.Any()))
        );
        _conversationRepository.UpdateNoTrackingTime(initFilter,
            Builders<Conversation>.Update.Set("Messages.$.Reactions", new List<MessageReaction>()));

        var key = Guid.NewGuid();

        // Try to update existing reaction
        var conversationFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages, w => w.Id == param.MessageId)
        );
        var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            new BsonDocument("elem.ContactId", param.UserId));
        _conversationRepository.Update(key, conversationFilter,
            Builders<Conversation>.Update.Set("Messages.$.Reactions.$[elem].Type", param.Type),
            arrayFilter);

        // Fallback: add new reaction if user hasn't reacted yet
        var fallbackFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.Id, param.MessageId),
                    Builders<Message>.Filter.Not(
                        Builders<Message>.Filter.ElemMatch(m => m.Reactions, r => r.ContactId == param.UserId)
                    )
                )
            )
        );
        _conversationRepository.AddFallback(key, fallbackFilter,
            Builders<Conversation>.Update.Push("Messages.$.Reactions",
                new MessageReaction { ContactId = param.UserId, Type = param.Type! }));

        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.StoredReaction, new NewReactionModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            Type = param.Type
        });
    }
}
