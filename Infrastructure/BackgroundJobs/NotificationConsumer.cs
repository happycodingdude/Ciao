namespace Infrastructure.BackgroundJobs;

public class NotificationConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IMapper _mapper;
    readonly UserCache _userCache;
    readonly MemberCache _memberCache;
    readonly IContactRepository _contactRepository;
    readonly IFirebaseFunction _firebaseFunction;
    readonly INotificationRepository _notificationRepository;
    readonly IConversationRepository _conversationRepository;
    readonly IUnitOfWork _uow;

    public NotificationConsumer(ILogger logger, IMapper mapper, UserCache userCache, MemberCache memberCache, IContactRepository contactRepository, IFirebaseFunction firebaseFunction, INotificationRepository notificationRepository, IConversationRepository conversationRepository, IUnitOfWork uow)
    {
        _logger = logger;
        _mapper = mapper;
        _userCache = userCache;
        _memberCache = memberCache;
        _contactRepository = contactRepository;
        _firebaseFunction = firebaseFunction;
        _notificationRepository = notificationRepository;
        _conversationRepository = conversationRepository;
        _uow = uow;
    }

    public async Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.Information("[{Consumer}] [{Topic}] {Message}", nameof(NotificationConsumer), param.cr.Topic, param.cr.Message.Value);

            switch (param.cr.Topic)
            {
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
                case Topic.NotifyNewReaction:
                    await HandleNewReaction(JsonConvert.DeserializeObject<NotifyNewReactionModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyMessageDelivered:
                    await HandleNotifyMessageDelivered(JsonConvert.DeserializeObject<NotifyMessageDeliveredModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyMessageRead:
                    await HandleNotifyMessageRead(JsonConvert.DeserializeObject<NotifyMessageReadModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyMessageEdited:
                    await HandleNotifyMessageEdited(JsonConvert.DeserializeObject<NotifyMessageEditedModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyMessageRecalled:
                    await HandleNotifyMessageRecalled(JsonConvert.DeserializeObject<NotifyMessageRecalledModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyConversationAppearanceChanged:
                    await HandleNotifyConversationAppearanceChanged(JsonConvert.DeserializeObject<NotifyConversationAppearanceChangedModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyPoll:
                    await HandleNotifyPoll(JsonConvert.DeserializeObject<NotifyPollModel>(param.cr.Message.Value)!);
                    break;
                case Topic.NotifyLinkPreview:
                    await HandleNotifyLinkPreview(JsonConvert.DeserializeObject<StoredLinkPreviewModel>(param.cr.Message.Value)!);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(NotificationConsumer), param.cr.Topic);
        }
        finally
        {
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleNotifyMessageDelivered(NotifyMessageDeliveredModel param)
    {
        // Loại chính người vừa thực hiện delivered khỏi recipient list:
        //  - Tránh gửi FCM về cho user đã gây ra event (UI họ tự biết LastDeliveredTime của chính mình).
        //  - Giảm cost FCM, tránh echo loop trong UI khi multi-tab cùng user.
        // Pattern này đồng nhất với HandleNewMessage (Where ContactId != UserId).
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var recipients = members
            .Where(q => q.Contact.Id != param.ContactId)
            .Select(q => q.Contact.Id)
            .ToArray();
        if (recipients.Length == 0) return;

        await _firebaseFunction.Notify(
            ChatEventNames.MessageDelivered,
            recipients,
            param);
    }

    async Task HandleNotifyMessageRead(NotifyMessageReadModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var recipients = members
            .Where(q => q.Contact.Id != param.ContactId)
            .Select(q => q.Contact.Id)
            .ToArray();
        if (recipients.Length == 0) return;

        await _firebaseFunction.Notify(
            ChatEventNames.MessageRead,
            recipients,
            param);
    }

    async Task HandleNotifyMessageEdited(NotifyMessageEditedModel param)
    {
        // Fanout event MessageEdited tới các member khác (loại bỏ chính người vừa edit — UI họ đã
        // tự cập nhật optimistic + cache server). Không gửi push notification mới cho edit (tránh spam).
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var recipients = members
            .Where(q => q.Contact.Id != param.UserId)
            .Select(q => q.Contact.Id)
            .ToArray();
        if (recipients.Length == 0) return;

        await _firebaseFunction.Notify(
            ChatEventNames.MessageEdited,
            recipients,
            param);
    }

    async Task HandleNotifyMessageRecalled(NotifyMessageRecalledModel param)
    {
        // Fanout MessageRecalled tới mọi member khác người thực hiện. Lưu ý: với recall của moderator,
        // sender gốc (khác người recall) VẪN nhận event để ẩn tin của mình.
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var recipients = members
            .Where(q => q.Contact.Id != param.UserId)
            .Select(q => q.Contact.Id)
            .ToArray();
        if (recipients.Length == 0) return;

        await _firebaseFunction.Notify(
            ChatEventNames.MessageRecalled,
            recipients,
            param);
    }

    // Đổi theme hội thoại: fanout data-only event tới member khác actor (actor đã có theme mới
    // qua optimistic FE + system message từ response endpoint). Payload kèm EventSystemMessage
    // (id thật) để FE member khác append dòng hệ thống, dedupe theo id.
    async Task HandleNotifyConversationAppearanceChanged(NotifyConversationAppearanceChangedModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var recipients = members
            .Where(q => q.Contact.Id != param.UserId)
            .Select(q => q.Contact.Id)
            .ToArray();
        if (recipients.Length == 0) return;

        await _firebaseFunction.Notify(
            ChatEventNames.ConversationAppearanceChanged,
            recipients,
            new EventConversationAppearanceChanged
            {
                ConversationId = param.ConversationId,
                Wallpaper = param.Wallpaper,
                BubbleColor = param.BubbleColor,
                ChangedBy = param.UserId,
                SystemMessage = new EventSystemMessage
                {
                    Id = param.Message.Id,
                    Type = param.Message.Type,
                    Content = param.Message.Content,
                    ContactId = param.Message.ContactId,
                    CreatedTime = param.Message.CreatedTime
                }
            });
    }

    // Bình chọn: fanout state authoritative tới TẤT CẢ member để đồng bộ voterIds/đóng realtime.
    // Sync-only (không banner). Gửi cả actor: FE ghi đè optimistic bằng state server (idempotent),
    // duplicate/out-of-order an toàn. Không tạo Notification bell cho vote (tránh spam).
    async Task HandleNotifyPoll(NotifyPollModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var notify = new EventPollUpdated
        {
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            ClosedTime = param.ClosedTime,
            ClosedBy = param.ClosedBy,
            Options = param.Options
                .Select(o => new EventPollUpdated_Option { Key = o.Key, VoterIds = o.VoterIds })
                .ToList()
        };

        await _firebaseFunction.Notify(
            ChatEventNames.PollUpdated,
            members.Select(q => q.Contact.Id).ToArray(),
            notify);
    }

    // Preview Link: fanout thẻ preview tới TẤT CẢ member để hiển thị realtime (không cần reload).
    // Sync-only (không banner, không tạo Notification bell). Gửi cả sender: FE patch theo messageId,
    // idempotent với duplicate/out-of-order FCM.
    async Task HandleNotifyLinkPreview(StoredLinkPreviewModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);
        if (members is null) return;

        var previews = param.LinkPreviews is { Count: > 0 }
            ? param.LinkPreviews
            : (param.LinkPreview is not null ? new List<LinkPreview> { param.LinkPreview } : new List<LinkPreview>());
        var notify = new EventLinkPreviewReady
        {
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            LinkPreview = previews.Count > 0 ? previews[0] : param.LinkPreview,
            LinkPreviews = previews
        };

        await _firebaseFunction.Notify(
            ChatEventNames.LinkPreviewReady,
            members.Select(q => q.Contact.Id).ToArray(),
            notify);
    }

    async Task HandleNewMessage(NewStoredMessageModel param)
    {
        // Lọc bỏ chính sender khỏi danh sách Members nhận notify — sender không cần nhận push notification
        // cho message do mình gửi (UI đã có sẵn message ở local).
        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(await _userCache.GetInfo(param.UserId));
        // Media/file: Content vốn đã rỗng (DataStore set null) → giữ null để giảm payload FCM.
        // Các loại còn lại CẦN Content để FE render/preview realtime:
        //   sticker = id, gif = url, poll = câu hỏi, contact = tên.
        // Trước đây null-hoá mọi type ≠ text khiến GIF/Sticker realtime ra placeholder
        // (chỉ hiện đúng sau khi reload vì lúc đó đọc từ cache có đủ Content).
        notify.Content = notify.Type == AppConstants.MessageType_Media ? null : notify.Content;
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        // Phase 5 — Đợt 2b: lọc thêm member IsDeleted — người đã rời nhóm không nhận tin mới.
        // (Chat 1-1 không ảnh hưởng: DataStore đã reopen IsDeleted trước khi produce StoredMessage.)
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(
            param.Members.Where(q => q.ContactId != param.UserId && !q.IsDeleted).ToArray());

        var memberIds = notify.Members.Select(m => m.Contact.Id).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
        {
            if (contactMap.TryGetValue(member.Contact.Id, out var contact))
                member.Contact = _mapper.Map<ContactInfoMoreDetails>(contact);
            member.IsNotifying = true;
        }

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            notify.Members.Select(q => q.Contact.Id).ToArray(),
            notify);

        // Phase 5 — @mention: lưu Notification cho người bị tag để hiện ở trang Informations.
        // Chỉ áp dụng cho group; recipient phải là member thật (lọc người đã rời) và ≠ sender.
        // Đặt SAU FCM nên lỗi persist (nếu có) không chặn realtime/push (đã gửi xong).
        await PersistMentionNotifications(param);
    }

    // Tạo notification cho các userId trong Message.Mentions (sentinel "all" = cả nhóm).
    async Task PersistMentionNotifications(NewStoredMessageModel param)
    {
        var mentions = param.Message.Mentions;
        if (!param.Conversation.IsGroup || mentions is null || mentions.Count == 0) return;

        // Đợt 2b: loại member đã rời — mention không tạo notification cho người ngoài nhóm.
        var memberIds = param.Members.Where(m => !m.IsDeleted).Select(m => m.ContactId).ToHashSet();
        var isAll = mentions.Contains("all");
        var recipients = (isAll ? memberIds.AsEnumerable() : mentions.Where(memberIds.Contains))
            .Where(id => id != param.UserId)
            .Distinct()
            .ToArray();
        if (recipients.Length == 0) return;

        var sender = await _userCache.GetInfo(param.UserId);
        var senderName = sender?.Name ?? "Someone";
        var group = param.Conversation.Title;

        foreach (var recipient in recipients)
        {
            _notificationRepository.Add(new Notification
            {
                ContactId = recipient,
                SourceType = "mention",
                SourceId = param.Conversation.Id,
                Content = isAll
                    ? $"{senderName} mentioned everyone in {group}"
                    : $"{senderName} mentioned you in {group}",
                ActorName = senderName,
                ActorAvatar = sender?.Avatar ?? "",
                Action = isAll ? "mentioned everyone" : "mentioned you",
                Preview = group ?? "",
                SourceMessageId = param.Message.Id ?? "",
            });
        }
        await _uow.SaveAsync();
    }

    async Task HandleNewGroupConversation(NewStoredGroupConversationModel param)
    {
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(
            param.Members.Where(q => q.ContactId != param.UserId).ToArray());

        var memberIds = param.Members.Select(m => m.ContactId).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
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

        await _firebaseFunction.Notify(
            ChatEventNames.NewConversation,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify);
    }

    async Task HandleNewDirectConversation(NewStoredDirectConversationModel param)
    {
        if (param.Message is null) return;

        var notify = _mapper.Map<EventNewMessage>(param.Message);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);
        var user = await _userCache.GetInfo(param.UserId);
        notify.Contact = _mapper.Map<EventNewMessage_Contact>(user);

        var contact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(param.ContactId));

        var targetUser = notify.Members.Single(q => q.Contact.Id == param.ContactId);
        targetUser.Contact.Name = contact.Name;
        targetUser.Contact.Avatar = contact.Avatar;
        targetUser.Contact.Bio = contact.Bio;
        targetUser.Contact.IsOnline = contact.IsOnline;

        var thisUser = notify.Members.Single(q => q.Contact.Id == param.UserId);
        thisUser.Contact.Name = user.Name;
        thisUser.Contact.Avatar = user.Avatar;
        thisUser.Contact.Bio = user.Bio;
        thisUser.Contact.IsOnline = true;

        await _firebaseFunction.Notify(
            ChatEventNames.NewMessage,
            new[] { param.ContactId },
            notify);
    }

    async Task HandleNewStoredMember(NewStoredGroupConversationModel param)
    {
        var notify = _mapper.Map<EventNewConversation>(param);
        notify.Conversation = _mapper.Map<EventNewMessage_Conversation>(param.Conversation);
        notify.Members = _mapper.Map<EventNewConversation_Member[]>(param.Members);

        var memberIds = notify.Members.Select(m => m.Contact.Id).ToArray();
        var contacts = await _contactRepository.GetAllAsync(
            MongoQuery<Contact>.ContactIdFilter(memberIds));
        var contactMap = contacts.ToDictionary(c => c.Id);

        foreach (var member in notify.Members)
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

        await _firebaseFunction.Notify(
            ChatEventNames.NewMembers,
            param.Members.Select(q => q.ContactId).ToArray(),
            notify);
    }

    async Task HandleNewReaction(NotifyNewReactionModel param)
    {
        var members = await _memberCache.GetMembers(param.ConversationId);

        // Load message (tác giả) + reactor 1 lần, dùng chung cho cả banner payload lẫn persist.
        // GetItemAsync cả conversation: nhất quán pattern hiện có (có thể tối ưu projection sau).
        var conversation = await _conversationRepository.GetItemAsync(
            MongoQuery<Conversation>.IdFilter(param.ConversationId));
        var message = conversation?.Messages?.SingleOrDefault(m => m.Id == param.MessageId);
        var reactor = await _userCache.GetInfo(param.UserId);
        var reactorName = reactor?.Name ?? "Someone";

        // Event gửi cho TẤT CẢ member để đồng bộ count realtime; kèm MessageOwnerId + ReactorName
        // để FE quyết định có banner (chỉ chủ tin, ≠ reactor) và dựng nội dung không cần lookup.
        var notify = new EventNewReaction
        {
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            Type = param.Type,
            ReactorId = param.UserId,
            ReactorName = reactorName,
            ReactorAvatar = reactor?.Avatar,
            MessageOwnerId = message?.ContactId,
            LikeCount = param.LikeCount,
            LoveCount = param.LoveCount,
            CareCount = param.CareCount,
            WowCount = param.WowCount,
            SadCount = param.SadCount,
            AngryCount = param.AngryCount,
        };

        await _firebaseFunction.Notify(
            ChatEventNames.NewReaction,
            members.Select(q => q.Contact.Id).ToArray(),
            notify);

        // Phase 4 — lưu Notification cho TÁC GIẢ message bị react (tái dùng message/reactor đã load).
        // Chỉ SaveAsync khi thực sự thêm bản ghi (tránh round-trip thừa cho unreact / tự-react).
        if (PersistReactionNotification(param, message, reactor, reactorName))
            await _uow.SaveAsync();
    }

    bool PersistReactionNotification(
        NotifyNewReactionModel param, Message? message, Contact? reactor, string reactorName)
    {
        // Type rỗng = unreact (gỡ) → không tạo notification (tránh spam khi gỡ tym).
        if (string.IsNullOrEmpty(param.Type)) return false;
        if (message is null) return false;
        // Tự react message của chính mình → không cần báo.
        if (message.ContactId == param.UserId) return false;

        _notificationRepository.Add(new Notification
        {
            ContactId = message.ContactId,
            SourceType = "reaction",
            SourceId = param.ConversationId,
            Content = $"{reactorName} reacted to your message",
            ActorName = reactorName,
            ActorAvatar = reactor?.Avatar ?? "",
            Action = "reacted to your message",
            Preview = message.Type == "text" ? (message.Content ?? "") : "",
            SourceMessageId = param.MessageId ?? "",
        });
        return true;
    }
}
