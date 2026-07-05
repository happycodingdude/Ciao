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
                case Topic.MessageDelivered:
                    await HandleMessageDelivered(JsonConvert.DeserializeObject<MessageDeliveredModel>(param.cr.Message.Value)!);
                    break;
                case Topic.MessageRead:
                    await HandleMessageRead(JsonConvert.DeserializeObject<MessageReadModel>(param.cr.Message.Value)!);
                    break;
                case Topic.MessageEdited:
                    await HandleMessageEdited(JsonConvert.DeserializeObject<MessageEditedModel>(param.cr.Message.Value)!);
                    break;
                case Topic.MessageRecalled:
                    await HandleMessageRecalled(JsonConvert.DeserializeObject<MessageRecalledModel>(param.cr.Message.Value)!);
                    break;
                case Topic.PollVote:
                    await HandlePollVote(JsonConvert.DeserializeObject<PollVoteModel>(param.cr.Message.Value)!);
                    break;
                case Topic.PollClose:
                    await HandlePollClose(JsonConvert.DeserializeObject<PollCloseModel>(param.cr.Message.Value)!);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(DataStoreConsumer), param.cr.Topic);
        }
        finally
        {
            // Commit offset bất kể xử lý thành công hay lỗi để tránh kẹt partition.
            // Lưu ý: nếu handler ném exception, message coi như đã "tiêu thụ" và sẽ KHÔNG được retry.
            // → Mọi retry/idempotency phải xử lý ở tầng handler, không dựa vào Kafka redelivery.
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleMessageDelivered(MessageDeliveredModel param)
    {
        // Idempotency: chỉ update khi DeliveredTime mới hơn LastDeliveredTime hiện có.
        // ElemMatch với điều kiện LastDeliveredTime null hoặc < DeliveredTime đảm bảo:
        //  - Duplicate event (Kafka redelivery, multi-tab spam) → no-op tự nhiên ở Mongo (không match → không update).
        //  - Event out-of-order (tab A gửi delivered cũ sau tab B gửi mới) → giữ nguyên trạng thái mới hơn.
        // KHÔNG load document trước → 1 round-trip, tránh race condition read-modify-write.
        var conversationFilter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Members,
                m => m.ContactId == param.UserId
                    && (m.LastDeliveredTime == null || m.LastDeliveredTime < param.DeliveredTime))
        );
        var conversationUpdates = Builders<Conversation>.Update
            .Set("Members.$.LastDeliveredMessageId", param.MessageId)
            .Set("Members.$.LastDeliveredTime", param.DeliveredTime);

        _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates);
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NotifyMessageDelivered, new NotifyMessageDeliveredModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            ContactId = param.UserId,
            MessageId = param.MessageId,
            DeliveredTime = param.DeliveredTime
        });
    }

    async Task HandleMessageRead(MessageReadModel param)
    {
        // Tách thành 2 update độc lập vì 2 điều kiện idempotency khác nhau:
        //  - Op1: chỉ update LastSeenTime khi mới hơn (idempotent ở Mongo qua ElemMatch điều kiện thời gian).
        //  - Op2: read implies delivered — nếu LastDeliveredTime null hoặc cũ hơn ReadTime,
        //         cập nhật cả delivered horizon (đã đọc thì chắc chắn đã nhận).
        // Cả 2 ops cùng UnitOfWork.SaveAsync → chạy trong 1 transaction Mongo.
        var readFilter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Members,
                m => m.ContactId == param.UserId
                    && (m.LastSeenTime == null || m.LastSeenTime < param.ReadTime))
        );
        var readUpdate = Builders<Conversation>.Update
            .Set("Members.$.LastSeenTime", param.ReadTime);
        _conversationRepository.UpdateNoTrackingTime(readFilter, readUpdate);

        var deliveredFilter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Members,
                m => m.ContactId == param.UserId
                    && (m.LastDeliveredTime == null || m.LastDeliveredTime < param.ReadTime))
        );
        var deliveredUpdate = Builders<Conversation>.Update
            .Set("Members.$.LastDeliveredMessageId", param.MessageId)
            .Set("Members.$.LastDeliveredTime", param.ReadTime);
        _conversationRepository.UpdateNoTrackingTime(deliveredFilter, deliveredUpdate);

        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NotifyMessageRead, new NotifyMessageReadModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            ContactId = param.UserId,
            MessageId = param.MessageId,
            ReadTime = param.ReadTime
        });
    }

    async Task HandleMessageEdited(MessageEditedModel param)
    {
        // Idempotent ở Mongo layer: chỉ update khi EditedTime null hoặc cũ hơn param.EditedTime
        // (last-write-wins an toàn cho concurrency 2 thiết bị cùng sender edit đồng thời).
        // ElemMatch điều kiện thời gian → duplicate/out-of-order event = no-op tự nhiên (không match).
        var filter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                m => m.Id == param.MessageId
                    && m.RecalledTime == null
                    && (m.EditedTime == null || m.EditedTime < param.EditedTime))
        );
        var updates = Builders<Conversation>.Update
            .Set("Messages.$.Content", param.Content)
            .Set("Messages.$.EditedTime", param.EditedTime);
        _conversationRepository.UpdateNoTrackingTime(filter, updates);
        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NotifyMessageEdited, new NotifyMessageEditedModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            Content = param.Content,
            EditedTime = param.EditedTime
        });
    }

    async Task HandleMessageRecalled(MessageRecalledModel param)
    {
        // Trong cùng 1 transaction (UnitOfWork batch → 1 Mongo session):
        //  Op1: set recalled fields + clear Content/Attachments + unpin (idempotent: chỉ khi RecalledTime==null).
        //  Op2: overwrite ReplyContent của MỌI reply trỏ tới message này về placeholder (chống leak privacy).
        // Eager (không lazy ở FE) vì tin gốc có thể nằm ngoài cửa sổ paginated của FE.
        var conversationFilter = MongoQuery<Conversation>.IdFilter(param.ConversationId);

        var recallFilter = Builders<Conversation>.Filter.And(
            conversationFilter,
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                m => m.Id == param.MessageId && m.RecalledTime == null)
        );
        var recallUpdates = Builders<Conversation>.Update
            .Set("Messages.$.RecalledTime", param.RecalledTime)
            .Set("Messages.$.RecalledByContactId", param.RecalledByContactId)
            .Set("Messages.$.Content", string.Empty)
            .Set("Messages.$.Attachments", new List<Attachment>())
            .Set("Messages.$.IsPinned", false);
        _conversationRepository.UpdateNoTrackingTime(recallFilter, recallUpdates);

        var replyArrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            new BsonDocument("reply.ReplyId", param.MessageId));
        var replyUpdates = Builders<Conversation>.Update
            .Set("Messages.$[reply].ReplyContent", AppConstants.Message_Recalled);
        _conversationRepository.UpdateNoTrackingTime(conversationFilter, replyUpdates, replyArrayFilter);

        await _uow.SaveAsync();

        await _kafkaProducer.ProduceAsync(Topic.NotifyMessageRecalled, new NotifyMessageRecalledModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            RecalledTime = param.RecalledTime,
            RecalledByContactId = param.RecalledByContactId
        });
    }

    // Bỏ phiếu bình chọn — atomic, KHÔNG read-modify-write (chống mất phiếu khi vote đồng thời).
    // Chỉ áp dụng khi poll còn mở (ClosedTime == null) — poll đã đóng → filter không match → no-op.
    async Task HandlePollVote(PollVoteModel param)
    {
        // Match đúng message có poll đang mở trong conversation. Positional "$" trỏ tới message này.
        var messageFilter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                m => m.Id == param.MessageId && m.Poll != null && m.Poll.ClosedTime == null)
        );

        var optionArrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            new BsonDocument("opt.Key", param.OptionKey));

        if (param.AllowMultiple)
        {
            // Chọn nhiều: TOGGLE trên option được chọn (thêm nếu chưa có, gỡ nếu đã có).
            // Dùng cặp Update(key)+AddFallback(key) như reaction: pull trước, nếu không gỡ được gì thì addToSet.
            var key = Guid.NewGuid();
            _conversationRepository.Update(key, messageFilter,
                Builders<Conversation>.Update.Pull("Messages.$.Poll.Options.$[opt].VoterIds", param.UserId),
                optionArrayFilter);
            _conversationRepository.AddFallback(key, messageFilter,
                Builders<Conversation>.Update.AddToSet("Messages.$.Poll.Options.$[opt].VoterIds", param.UserId),
                optionArrayFilter);
        }
        else
        {
            // Chọn một: độc quyền — gỡ phiếu khỏi TẤT CẢ option ($[]) rồi thêm vào option được chọn.
            // Hai op tách biệt (không thể vừa pull vừa addToSet cùng path Options trong 1 update → xung đột).
            _conversationRepository.UpdateNoTrackingTime(messageFilter,
                Builders<Conversation>.Update.Pull("Messages.$.Poll.Options.$[].VoterIds", param.UserId));
            _conversationRepository.UpdateNoTrackingTime(messageFilter,
                Builders<Conversation>.Update.AddToSet("Messages.$.Poll.Options.$[opt].VoterIds", param.UserId),
                optionArrayFilter);
        }

        await _uow.SaveAsync();

        // Persist Mongo xong → phát tiếp để CacheConsumer đồng bộ Redis message cache (nguồn đọc
        // của GetMessages) + fanout realtime. Nếu poll đã đóng, Mongo no-op nhưng ta vẫn phát:
        // CacheConsumer mirror cùng guard (ClosedTime==null) nên sẽ no-op tương ứng, không lệch.
        await _kafkaProducer.ProduceAsync(Topic.StoredPollVote, param);
    }

    // Đóng bình chọn — chỉ người tạo poll (ContactId == UserId) mới đóng được; idempotent (chỉ khi đang mở).
    async Task HandlePollClose(PollCloseModel param)
    {
        var filter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                m => m.Id == param.MessageId
                    && m.ContactId == param.UserId
                    && m.Poll != null
                    && m.Poll.ClosedTime == null)
        );
        var update = Builders<Conversation>.Update
            .Set("Messages.$.Poll.ClosedTime", DateTime.UtcNow)
            .Set("Messages.$.Poll.ClosedBy", param.UserId);
        _conversationRepository.UpdateNoTrackingTime(filter, update);
        await _uow.SaveAsync();

        // Đồng bộ Redis cache + realtime. CacheConsumer mirror guard (chỉ creator + đang mở)
        // nên nếu người gọi không phải creator, cache no-op và không fanout.
        await _kafkaProducer.ProduceAsync(Topic.StoredPollClose, param);
    }

    async Task HandleNewMessage(NewMessageModel param)
    {
        var filter = MongoQuery<Conversation>.IdFilter(param.ConversationId);
        var conversation = await _conversationRepository.GetItemAsync(filter);

        var message = _mapper.Map<Message>(param.Message);
        message.ContactId = param.UserId;
        if (message.Type == "media") message.Content = default!;
        // Bình chọn: khởi tạo sạch — không tin phiếu/đóng do client gửi lên.
        if (message.Poll != null)
        {
            message.Poll.ClosedTime = null;
            message.Poll.ClosedBy = null;
            foreach (var option in message.Poll.Options)
                option.VoterIds = new List<string>();
        }
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
        // Direct conversation có 2 nhánh hoàn toàn khác nhau:
        //  - IsNewConversation = true  → tạo conversation + 2 member ngay
        //  - IsNewConversation = false → conversation đã tồn tại (vd. user từng xóa rồi nhắn lại),
        //    chỉ cần "reopen" member đang IsDeleted và append message.
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
            // Chỉ phát sinh Replace khi thực sự có thay đổi (reopen member hoặc thêm message),
            // tránh ghi đè document không cần thiết → giảm tải Mongo và tránh đụng UpdatedTime vô nghĩa.
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
        // Mongo không có upsert nguyên tử cho element trong nested array dựa vào điều kiện
        // "tồn tại reaction của userId hay chưa". Chiến thuật chia làm 3 op trong cùng 1 transaction:
        //
        //   1) Init mảng Reactions nếu null/empty (idempotent — chỉ chạy lần đầu).
        //   2) Update reaction sẵn có theo arrayFilter elem.ContactId == userId.
        //   3) Fallback push reaction mới nếu user CHƯA từng react (filter dùng $not + $elemMatch).
        //
        // UnitOfWork dùng cùng `key` để liên kết (2) ↔ (3): nếu (2) ModifiedCount==0 thì (3) được chạy.
        // → Không thể "vừa update vừa push" cùng lúc nên dùng pattern try-then-fallback này.

        // (1) Bảo đảm Messages.$.Reactions tồn tại (mảng rỗng) trước khi update theo arrayFilter,
        //     vì $[elem] sẽ no-op nếu mảng null.
        var initFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages,
                w => w.Id == param.MessageId && (w.Reactions == null || !w.Reactions.Any()))
        );
        _conversationRepository.UpdateNoTrackingTime(initFilter,
            Builders<Conversation>.Update.Set("Messages.$.Reactions", new List<MessageReaction>()));

        var key = Guid.NewGuid();

        // (2) Cố update Type cho reaction hiện hữu của user (đổi loại react).
        var conversationFilter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.Eq(c => c.Id, param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(q => q.Messages, w => w.Id == param.MessageId)
        );
        var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            new BsonDocument("elem.ContactId", param.UserId));
        _conversationRepository.Update(key, conversationFilter,
            Builders<Conversation>.Update.Set("Messages.$.Reactions.$[elem].Type", param.Type),
            arrayFilter);

        // (3) Fallback: nếu (2) không match (user chưa từng react), push reaction mới.
        // Filter $not + $elemMatch đảm bảo không double-push khi 2 consumer cùng xử lý đồng thời.
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
