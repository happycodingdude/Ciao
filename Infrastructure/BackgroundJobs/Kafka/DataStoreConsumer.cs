﻿namespace Infrastructure.BackgroundJobs;

public class DataStoreConsumer : IGenericConsumer
{
    readonly IUnitOfWork _uow;
    readonly IMapper _mapper;
    readonly IConversationRepository _conversationRepository;
    readonly IContactRepository _contactRepository;
    readonly IKafkaProducer _kafkaProducer;

    public DataStoreConsumer(IUnitOfWork uow, IMapper mapper, IConversationRepository conversationRepository, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
    {
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
            Console.WriteLine("DataStoreConsumer receives...");
            Console.WriteLine(JsonConvert.SerializeObject(param.cr.Topic));
            Console.WriteLine(JsonConvert.SerializeObject(param.cr.Message));

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
            ConversationId = param.ConversationId,
            Message = message
        });
    }

    async Task HandleNewGroupConversation(NewGroupConversationModel param)
    {
        var conversation = _mapper.Map<Conversation>(param);

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

        await _kafkaProducer.ProduceAsync(Topic.NewStoredGroupConversation, param);
    }

    async Task HandleNewDirectConversation(NewDirectConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);

        var message = string.IsNullOrEmpty(param.Message)
                ? null
                : new Message
                {
                    ContactId = user.Id,
                    Type = "text",
                    Content = param.Message
                };

        var filter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == user.Id),
            Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == param.ContactId),
            Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
        );
        var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();

        var isNewConversation = conversation is null;
        if (isNewConversation)
            conversation = HandleNewConversation(param.ContactId, param.UserId, message);
        else
            HandleOldConversation(conversation, param.UserId, message);

        // Save changes
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NewStoredDirectConversation, new NewStoredDirectConversationModel
        {
            UserId = param.UserId,
            ContactId = param.ContactId,
            Conversation = _mapper.Map<ConversationCacheModel>(conversation),
            Members = _mapper.Map<MemberWithContactInfo[]>(conversation.Members),
            Message = message,
            IsNewConversation = isNewConversation
        });


        Conversation HandleNewConversation(string contactId, string userId, Message message)
        {
            // var userId = _contactRepository.GetUserId();

            var newConversation = new Conversation();
            // Add target contact
            newConversation.Members.Add(new Member
            {
                IsModerator = false,
                IsDeleted = false,
                IsNotifying = true,
                ContactId = contactId
            });
            // Add this user
            newConversation.Members.Add(new Member
            {
                IsModerator = true,
                IsDeleted = false,
                IsNotifying = true,
                ContactId = userId
            });
            // If send with message -> add new message
            if (message is not null)
                newConversation.Messages.Add(message);

            _conversationRepository.Add(newConversation);

            return newConversation;
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
}