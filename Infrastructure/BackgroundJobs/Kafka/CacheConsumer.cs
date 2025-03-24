namespace Infrastructure.BackgroundJobs;

public class CacheConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IMapper _mapper;
    readonly MessageCache _messageCache;
    readonly ConversationCache _conversationCache;
    readonly UserCache _userCache;
    readonly MemberCache _memberCache;
    readonly FriendCache _friendCache;
    readonly IContactRepository _contactRepository;
    readonly IConversationRepository _conversationRepository;
    readonly IFriendRepository _friendRepository;
    readonly IKafkaProducer _kafkaProducer;

    public CacheConsumer(ILogger logger, IMapper mapper, MessageCache messageCache, ConversationCache conversationCache, UserCache userCache, MemberCache memberCache, FriendCache friendCache, IContactRepository contactRepository, IConversationRepository conversationRepository, IFriendRepository friendRepository, IKafkaProducer kafkaProducer)
    {
        _logger = logger;
        _mapper = mapper;
        _messageCache = messageCache;
        _conversationCache = conversationCache;
        _userCache = userCache;
        _memberCache = memberCache;
        _friendCache = friendCache;
        _contactRepository = contactRepository;
        _conversationRepository = conversationRepository;
        _friendRepository = friendRepository;
        _kafkaProducer = kafkaProducer;
    }

    public async Task ProcessMesageAsync(ConsumerResultData param)
    {
        try
        {
            _logger.Information($"[CacheConsumer] [{param.cr.Topic}] [{param.cr.Message.Value}]");

            switch (param.cr.Topic)
            {
                case Topic.UserLogin:
                    var userLoginModel = JsonConvert.DeserializeObject<UserLoginModel>(param.cr.Message.Value);
                    await HandleUserLogin(userLoginModel);
                    break;
                case Topic.StoredMessage:
                    var newStoredMessageModel = JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value);
                    await HandleNewMessage(newStoredMessageModel);
                    break;
                case Topic.StoredGroupConversation:
                    var newStoredGroupConversationModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewGroupConversation(newStoredGroupConversationModel);
                    break;
                case Topic.StoredDirectConversation:
                    var newStoredDirectConversationModel = JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value);
                    await HandleNewDirectConversation(newStoredDirectConversationModel);
                    break;
                case Topic.StoredMember:
                    var newStoredMemberModel = JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value);
                    await HandleNewStoredMember(newStoredMemberModel);
                    break;
                case Topic.StoredReaction:
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

    /* MARK: USER LOGIN */
    async Task HandleUserLogin(UserLoginModel param)
    {
        var userTask = _contactRepository.GetInfoAsync(param.UserId)
            .ContinueWith(task =>
            {
                var user = task.Result;
                _userCache.SetToken(param.UserId, param.Token);
                _userCache.SetInfo(user);
            });

        var conversationTask = _conversationRepository
            .GetConversationsWithUnseenMesages(param.UserId, new PagingParam(1, 100))
            .ContinueWith(async task =>
            {
                var conversations = task.Result;
                conversations.ToList().ForEach(q =>
                {
                    var member = q.Members.SingleOrDefault(m => m.Contact.Id == param.UserId);
                    if (member != null)
                        member.Contact.IsOnline = true;
                });
                foreach (var conversation in conversations)
                {
                    foreach (var message in conversation.Messages)
                    {
                        var (likes, loves, cares, wows, sads, angries) = CalculateReactionCount(message.Reactions);
                        message.LikeCount = likes;
                        message.LoveCount = loves;
                        message.CareCount = cares;
                        message.WowCount = wows;
                        message.SadCount = sads;
                        message.AngryCount = angries;
                    }
                }
                await _conversationCache.SetConversations(param.UserId, conversations.ToList());
            }).Unwrap();

        var friendsTask = _friendRepository.GetFriendItems(param.UserId)
            .ContinueWith(async task =>
            {
                await _friendCache.SetFriends(param.UserId, task.Result);
            }).Unwrap();

        await Task.WhenAll(userTask, conversationTask, friendsTask);
    }

    /* MARK: NEW MESSAGE */
    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        var message = _mapper.Map<MessageWithReactions>(param.Message);

        await _messageCache.AddMessages(param.UserId, conversationToCache.Id, conversationToCache.UpdatedTime.Value, message);
    }

    /* MARK: NEW GROUP CONVERSATION */
    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        // var conversation = _mapper.Map<Conversation>(param);
        var contactFilter = Builders<Contact>.Filter.Where(q => param.Members.Select(w => w.ContactId).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
        foreach (var member in memberToCache.Where(q => q.Contact.Id != param.UserId))
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            member.IsNotifying = true;
        }
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;
        thisUser.IsNotifying = true;
        thisUser.IsModerator = true;

        // _logger.Information(JsonConvert.SerializeObject(param.Conversation));
        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        // _logger.Information(JsonConvert.SerializeObject(conversationToCache));
        await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray());

        // Check if any receiver is online then update receiver cache
        var membersToNotify = param.Members.Where(q => q.ContactId != user.Id).Select(q => q.ContactId).ToArray();
        var receivers = await _userCache.GetInfo(membersToNotify);
        if (receivers.Any())
            await _conversationCache.AddConversation(receivers.Select(q => q.Id).ToArray(), param.Conversation.Id);
    }

    /* MARK: NEW DIRECT CONVERSATION */
    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        var user = await _contactRepository.GetInfoAsync(param.UserId);
        // var memberToCache = new List<MemberWithContactInfo>(2);
        // Check if receiver is online then update receiver cache
        var receiver = _userCache.GetInfo(param.ContactId);
        if (param.IsNewConversation)
        {
            // Update cache
            var contactFilter = MongoQuery<Contact>.IdFilter(param.ContactId);
            var contact = await _contactRepository.GetItemAsync(contactFilter);
            var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
            var targetUser = memberToCache.SingleOrDefault(q => q.Contact.Id == param.ContactId);
            targetUser.Contact.Name = contact.Name;
            targetUser.Contact.Avatar = contact.Avatar;
            targetUser.Contact.Bio = contact.Bio;
            targetUser.Contact.IsOnline = contact.IsOnline;
            var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == user.Id);
            thisUser.Contact.Name = user.Name;
            thisUser.Contact.Avatar = user.Avatar;
            thisUser.Contact.Bio = user.Bio;
            thisUser.Contact.IsOnline = true;

            var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
            if (param.Message is not null)
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray(), _mapper.Map<MessageWithReactions>(param.Message));

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
            else
            {
                await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache.ToArray());

                if (receiver is not null)
                    await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
            }
        }
        else if (param.Message is not null)
        {
            await _messageCache.AddMessages(user.Id, param.Conversation.Id, param.Conversation.UpdatedTime.Value, _mapper.Map<MessageWithReactions>(param.Message));
        }
    }

    /* MARK: NEW MEMBER */
    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        var newMembers = _mapper.Map<List<MemberWithContactInfo>>(param.Members.Where(q => q.IsNew));

        var contactFilter = Builders<Contact>.Filter.Where(q => newMembers.Select(q => q.Contact.Id).Contains(q.Id));
        var contacts = await _contactRepository.GetAllAsync(contactFilter);

        foreach (var member in newMembers)
        {
            member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
            member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
            member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
            member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
        }

        await _memberCache.AddMembers(param.Conversation.Id, newMembers);

        // Check if any receiver is online then update receiver cache
        var membersToNotify = newMembers.Select(q => q.Contact.Id).ToArray();
        var receivers = await _userCache.GetInfo(membersToNotify);
        if (receivers.Any())
            await _conversationCache.AddConversation(receivers.Select(q => q.Id).ToArray(), param.Conversation.Id);
    }

    /* MARK: NEW REACTION */
    async Task HandleNewReaction(NewReactionModel param)
    {
        var reactions = await _messageCache.UpdateReactions(param.ConversationId, param.MessageId, param.UserId, param.Type);

        var (likes, loves, cares, wows, sads, angries) = CalculateReactionCount(reactions);
        await _kafkaProducer.ProduceAsync(Topic.NotifyNewReaction, new NotifyNewReactionModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            LikeCount = likes,
            LoveCount = loves,
            CareCount = cares,
            WowCount = wows,
            SadCount = sads,
            AngryCount = angries
        });
    }

    /* MARK: HELPER FUNCTIONS */
    (int, int, int, int, int, int) CalculateReactionCount(List<MessageReaction> reactions)
    {
        return (reactions.Count(q => q.Type == AppConstants.MessageReactionType_Like),
        reactions.Count(q => q.Type == AppConstants.MessageReactionType_Love),
        reactions.Count(q => q.Type == AppConstants.MessageReactionType_Care),
        reactions.Count(q => q.Type == AppConstants.MessageReactionType_Wow),
        reactions.Count(q => q.Type == AppConstants.MessageReactionType_Sad),
        reactions.Count(q => q.Type == AppConstants.MessageReactionType_Angry));
    }
}