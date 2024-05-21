namespace Chat.API.Implement;

public class ConversationService : BaseService<Conversation, ConversationDto>, IConversationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ConversationService(IConversationRepository repo,
    IUnitOfWork unitOfWork,
    INotificationService notificationService,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages(int page, int limit)
    {
        var messageDbSet = _unitOfWork.Message.DbSet;
        var participantDbSet = _unitOfWork.Participant.DbSet;
        Guid.TryParse(_httpContextAccessor.HttpContext.Session.GetString("UserId"), out var contactId);

        List<Conversation> entity;
        if (page != 0 && limit != 0)
            entity = _unitOfWork.Conversation.DbSet
            .Where(q => q.Participants.Any(w => w.ContactId == contactId))
            .OrderByDescending(q => q.UpdatedTime)
            .Skip(limit * (page - 1))
            .Take(limit)
            .ToList();
        else
            entity = _unitOfWork.Conversation.DbSet
            .Where(q => q.Participants.Any(w => w.ContactId == contactId))
            .OrderByDescending(q => q.UpdatedTime)
            .ToList();
        var conversations = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(entity);
        foreach (var conversation in conversations)
        {
            conversation.IsNotifying = participantDbSet.FirstOrDefault(q => q.ConversationId == conversation.Id && q.ContactId == contactId).IsNotifying;

            conversation.UnSeenMessages = messageDbSet.Count(q => q.ConversationId == conversation.Id && q.ContactId != contactId && q.Status == "received");

            var participants = participantDbSet
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == conversation.Id)
            .ToList();
            conversation.Participants = _mapper.Map<List<Participant>, List<ParticipantNoReference>>(participants);

            var lastMessageEntity = messageDbSet.Where(q => q.ConversationId == conversation.Id).OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessageEntity == null) continue;
            conversation.LastMessageId = lastMessageEntity.Id;
            conversation.LastMessage = lastMessageEntity.Content;
            conversation.LastMessageTime = lastMessageEntity.CreatedTime;
            conversation.LastMessageContact = lastMessageEntity.ContactId;
            conversation.LastSeenTime = messageDbSet
            .Where(q => q.ConversationId == conversation.Id && q.ContactId == contactId && q.Status == "seen" && q.SeenTime.HasValue)
            .OrderByDescending(q => q.CreatedTime)
            .FirstOrDefault()?
            .SeenTime;
        }
        return conversations;
    }

    public async Task<ConversationDto> CreateAsync(ConversationDto model, bool includeNotify)
    {
        Add(model);

        if (includeNotify)
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);
            var notify = _mapper.Map<ConversationDto, ConversationToNotify>(model);
            foreach (var contact in model.Participants.Where(q => q.ContactId != contactId).Select(q => q.ContactId.ToString()))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<ConversationToNotify>(Constants.NotificationEvent_NewConversation, notify)
                };
                await _notificationService.Notify<ConversationToNotify>(Constants.NotificationEvent_NewConversation, connection, notify);
            }
        }
        return model;
    }
}