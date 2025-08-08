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
            _logger.Information($"[DataStoreConsumer] [{param.cr.Topic}] {param.cr.Message.Value}");

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
                case Topic.NewReaction:
                    var newReactionModel = JsonConvert.DeserializeObject<NewReactionModel>(param.cr.Message.Value);
                    await HandleNewReaction(newReactionModel);
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
    async Task HandleNewMessage(NewMessageModel param)
    {
        // Get current conversation
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        // Prepare message
        // var user = await _contactRepository.GetInfoAsync(param.UserId);
        var message = _mapper.Map<Message>(param.Message);
        message.ContactId = param.UserId;
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

        await _kafkaProducer.ProduceAsync(Topic.StoredMessage, new NewStoredMessageModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = conversation.Members.ToArray(),
            Message = message
        });
    }

    /* MARK: NEW GROUP CONVERSATION */
    async Task HandleNewGroupConversation(NewGroupConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param.Conversation);
        conversation.Members = _mapper.Map<List<Member>>(param.Members.ToList());

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

        // Add system message
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var systemMessage = new SystemMessage(AppConstants.SystemMessage_CreatedConversation.Replace("{user}", user?.Name));
        // Convert back to Message to remove field _t in Mongo
        var messageToAdd = _mapper.Map<Message>(systemMessage);
        conversation.Messages.Add(messageToAdd);

        // Create conversation
        _conversationRepository.Add(conversation);

        // Save changes
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.StoredGroupConversation, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = _mapper.Map<NewGroupConversationModel_Member[]>(conversation.Members),
            Message = messageToAdd
        });
    }

    /* MARK: NEW DIRECT CONVERSATION */
    async Task HandleNewDirectConversation(NewDirectConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);

        var conversation = _mapper.Map<Conversation>(param.Conversation);
        var message = _mapper.Map<Message>(param.Message);
        if (param.IsNewConversation)
            HandleNewConversation(conversation, param.ContactId, param.UserId, message);
        else
            HandleOldConversation(conversation, param.UserId, message);

        // Save changes
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
            // Add target contact
            conversation.Members.Add(new Member
            {
                IsNotifying = true,
                ContactId = contactId
            });
            // Add this user
            conversation.Members.Add(new Member
            {
                IsModerator = true,
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

    /* MARK: NEW MEMBER */
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
        // Create system message
        var contactFilter = Builders<Contact>.Filter.Where(q => membersToAdd.Select(w => w.ContactId).Contains(q.Id) || q.Id == param.UserId);
        var contacts = await _contactRepository.GetAllAsync(contactFilter);
        var systemMessage = new SystemMessage(
            AppConstants.SystemMessage_AddedMembers
                .Replace("{user}", contacts.FirstOrDefault(q => q.Id == param.UserId)?.Name)
                .Replace("{members}", string.Join(", ", contacts.Where(q => q.Id != param.UserId).Select(q => q.Name)))
        );
        // Convert back to Message to remove field _t in Mongo
        var messageToAdd = _mapper.Map<Message>(systemMessage);
        conversation.Messages.Add(messageToAdd);

        // Update to db
        var updates = Builders<Conversation>.Update
            .Set(q => q.Members, membersToUpdate)
            .Set(q => q.Messages, conversation.Messages);
        _conversationRepository.UpdateNoTrackingTime(filter, updates);
        // Save changes
        await _uow.SaveAsync();

        foreach (var memberToAdd in membersToAdd)
        {
            var member = _mapper.Map<NewGroupConversationModel_Member>(memberToAdd);
            member.IsNew = true;
            membersNextExecution.Add(member);
        }
        await _kafkaProducer.ProduceAsync(Topic.StoredMember, new NewStoredGroupConversationModel
        {
            UserId = param.UserId,
            Conversation = _mapper.Map<NewStoredGroupConversationModel_Conversation>(conversation),
            Members = membersNextExecution.ToArray(),
            Message = messageToAdd
        });
    }

    /* MARK: NEW REACTION */
    async Task HandleNewReaction(NewReactionModel param)
    {
        // Ensure Reactions is an empty array if not present
        var initializationFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages,
                w => w.Id == param.MessageId && (w.Reactions == null || !w.Reactions.Any()))
        );
        var initializeReactions = Builders<Conversation>.Update.Set(
            "Messages.$.Reactions",
            new List<MessageReaction>()
        );
        _conversationRepository.UpdateNoTrackingTime(initializationFilter, initializeReactions);

        var key = Guid.NewGuid();
        // Update if exists
        var conversationFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages, w => w.Id == param.MessageId)
        );
        var updates = Builders<Conversation>.Update.Set("Messages.$.Reactions.$[elem].Type", param.Type);
        // var userId = _contactRepository.GetUserId();
        var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            new BsonDocument("elem.ContactId", param.UserId)
            );
        _conversationRepository.Update(key, conversationFilter,
            Builders<Conversation>.Update.Combine(updates),
            arrayFilter);

        // Fallback: add a new reaction if it doesn't exist
        var fallbackFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(
                c => c.Messages,
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.Id, param.MessageId),
                    Builders<Message>.Filter.Not(
                        Builders<Message>.Filter.ElemMatch(m => m.Reactions, r => r.ContactId == param.UserId)
                    )
                )
            )
        );
        var create = Builders<Conversation>.Update.Push(
            "Messages.$.Reactions",
            new MessageReaction
            {
                ContactId = param.UserId,
                Type = param.Type
            }
        );
        _conversationRepository.AddFallback(key, fallbackFilter, create);

        // Save changes
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