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

    public async Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.Information("[{Consumer}] [{Topic}] {Message}", nameof(CacheConsumer), param.cr.Topic, param.cr.Message.Value);

            switch (param.cr.Topic)
            {
                case Topic.UserLogin:
                    await HandleUserLogin(JsonConvert.DeserializeObject<UserLoginModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredMessage:
                    await HandleNewMessage(JsonConvert.DeserializeObject<NewStoredMessageModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredGroupConversation:
                    await HandleNewGroupConversation(JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredDirectConversation:
                    await HandleNewDirectConversation(JsonConvert.DeserializeObject<NewStoredDirectConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredMember:
                    await HandleNewStoredMember(JsonConvert.DeserializeObject<NewStoredGroupConversationModel>(param.cr.Message.Value)!);
                    break;
                case Topic.StoredReaction:
                    await HandleNewReaction(JsonConvert.DeserializeObject<NewReactionModel>(param.cr.Message.Value)!);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(CacheConsumer), param.cr.Topic);
        }
        finally
        {
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleUserLogin(UserLoginModel param)
    {
        var userTask = async () =>
        {
            var user = await _contactRepository.GetInfoAsync(param.UserId);
            await _userCache.SetTokenAsync(param.UserId, param.Token);
            await _userCache.SetInfoAsync(user);
        };

        var conversationTask = async () =>
        {
            var conversations = (await _conversationRepository
                .GetConversationsWithUnseenMesages(param.UserId, new PagingParam(1, 100))).ToList();

            foreach (var conversation in conversations)
            {
                var member = conversation.Members.SingleOrDefault(m => m.Contact.Id == param.UserId);
                if (member != null) member.Contact.IsOnline = true;

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
            await _conversationCache.SetConversations(param.UserId, conversations);
        };

        var friendsTask = async () =>
        {
            var friends = await _friendRepository.GetFriendItems(param.UserId);
            await _friendCache.SetFriends(param.UserId, friends);
        };

        await Task.WhenAll(userTask(), conversationTask(), friendsTask());
    }

    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        var message = _mapper.Map<MessageWithReactions>(param.Message);
        await _messageCache.AddMessages(param.UserId, conversationToCache.Id, conversationToCache.UpdatedTime!.Value, message);
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        var memberIds = param.Members.Select(m => m.ContactId).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);
        foreach (var member in memberToCache)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
            {
                member.Contact.Name = contact.Name;
                member.Contact.Avatar = contact.Avatar;
                member.Contact.Bio = contact.Bio;
                member.Contact.IsOnline = contact.IsOnline;
            }
            member.IsNotifying = true;
        }

        var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == param.UserId);
        if (thisUser is not null) thisUser.IsModerator = true;

        var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
        await _conversationCache.AddConversation(param.UserId, conversationToCache, memberToCache.ToArray());
        await _messageCache.AddSystemMessage(param.Conversation.Id, _mapper.Map<MessageWithReactions>(param.Message));

        var otherMemberIds = param.Members.Where(q => q.ContactId != param.UserId).Select(q => q.ContactId).ToArray();
        var onlineReceivers = await _userCache.GetInfo(otherMemberIds);
        if (onlineReceivers.Any())
            await _conversationCache.AddConversation(onlineReceivers.Select(q => q.Id).ToArray(), param.Conversation.Id);
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        if (param.IsNewConversation)
        {
            var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(param.Members);

            var contact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(param.ContactId));
            var targetUser = memberToCache.Single(q => q.Contact.Id == param.ContactId);
            targetUser.Contact.Name = contact.Name;
            targetUser.Contact.Avatar = contact.Avatar;
            targetUser.Contact.Bio = contact.Bio;
            targetUser.Contact.IsOnline = contact.IsOnline;

            var user = await _userCache.GetInfo(param.UserId);
            var thisUser = memberToCache.Single(q => q.Contact.Id == param.UserId);
            thisUser.Contact.Name = user.Name;
            thisUser.Contact.Avatar = user.Avatar;
            thisUser.Contact.Bio = user.Bio;
            thisUser.Contact.IsOnline = true;

            var conversationToCache = _mapper.Map<ConversationCacheModel>(param.Conversation);
            if (param.Message is not null)
                await _conversationCache.AddConversation(param.UserId, conversationToCache, memberToCache.ToArray(), _mapper.Map<MessageWithReactions>(param.Message));
            else
                await _conversationCache.AddConversation(param.UserId, conversationToCache, memberToCache.ToArray());

            var receiver = await _userCache.GetInfo(param.ContactId);
            if (receiver is not null)
                await _conversationCache.AddConversation(receiver.Id, param.Conversation.Id);
        }
        else if (param.Message is not null)
        {
            await _messageCache.AddMessages(param.UserId, param.Conversation.Id, param.Conversation.UpdatedTime!.Value, _mapper.Map<MessageWithReactions>(param.Message));
        }
    }

    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        var newMembers = _mapper.Map<List<MemberWithContactInfo>>(param.Members);

        var memberIds = newMembers.Select(m => m.Contact.Id).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in newMembers)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
            {
                member.Contact.Name = contact.Name;
                member.Contact.Avatar = contact.Avatar;
                member.Contact.Bio = contact.Bio;
                member.Contact.IsOnline = contact.IsOnline;
            }
            member.IsNotifying = true;
        }

        await _memberCache.AddMembers(param.Conversation.Id, newMembers);
        await _messageCache.AddSystemMessage(param.Conversation.Id, _mapper.Map<MessageWithReactions>(param.Message));

        var membersToNotify = newMembers.Select(q => q.Contact.Id).ToArray();
        var onlineReceivers = await _userCache.GetInfo(membersToNotify);
        if (onlineReceivers.Any())
            await _conversationCache.AddConversation(onlineReceivers.Select(q => q.Id).ToArray(), param.Conversation.Id);
    }

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

    static (int, int, int, int, int, int) CalculateReactionCount(List<MessageReaction> reactions)
    {
        return (reactions.Count(q => q.Type == AppConstants.MessageReactionType_Like),
            reactions.Count(q => q.Type == AppConstants.MessageReactionType_Love),
            reactions.Count(q => q.Type == AppConstants.MessageReactionType_Care),
            reactions.Count(q => q.Type == AppConstants.MessageReactionType_Wow),
            reactions.Count(q => q.Type == AppConstants.MessageReactionType_Sad),
            reactions.Count(q => q.Type == AppConstants.MessageReactionType_Angry));
    }
}
