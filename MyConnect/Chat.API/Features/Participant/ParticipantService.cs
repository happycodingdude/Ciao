namespace Chat.API.Features.Participants;

public class ParticipantService : BaseService<Participant, ParticipantDto>, IParticipantService
{
    private readonly IUnitOfWork _unitOfWork;
    // private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ParticipantService(IParticipantRepository repo,
    IUnitOfWork unitOfWork,
    // INotificationService notificationService,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        // _notificationService = notificationService;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify = false)
    {
        // Get all participants of conversation
        var participants = _unitOfWork.Participant.GetByConversationId(conversationId);
        // Delete all participants about to add if exists
        //_unitOfWork.Participant.Delete(participants.Where(q => model.Any(w => w.ContactId == q.ContactId)).ToList());
        // Filter existed participant
        var filterNewItemToAdd = model.Select(q => q.ContactId).ToList().Except(participants.Select(q => q.ContactId).ToList());
        var filteredParticipants = model.Where(q => filterNewItemToAdd.Contains(q.ContactId));
        if (!filteredParticipants.Any()) return;
        Console.WriteLine("participantsToAdd count: " + filteredParticipants.Count());
        // Add new participants
        foreach (var item in filteredParticipants)
            item.ConversationId = conversationId;
        var participantsToAdd = _mapper.Map<List<ParticipantDto>, List<Participant>>(filteredParticipants.ToList());
        _unitOfWork.Participant.Add(participantsToAdd);
        await _unitOfWork.SaveAsync();

        // if (includeNotify)
        // {
        //     var contactId = Guid.Parse(_httpContextAccessor.HttpContext.Session.GetString("UserId"));
        //     foreach (var contact in allParticipants.Select(q => q.ContactId.ToString()).Where(q => q != contactId.ToString()))
        //     {
        //         var connection = _notificationService.GetConnection(contact);
        //         await _notificationService.NotifyAsync<IdModel>(Constants.NotificationEvent_AddMember, connection, new IdModel { Id = conversationId });
        //     }
        // }
        // var result = _unitOfWork.Participant.DbSet.Include(q => q.Contact).Where(q => q.ConversationId == conversationId && model.Any(w => w.ContactId == q.ContactId)).ToList();
        // return _mapper.Map<List<Participant>, List<ParticipantDto>>(result);
    }

    // public async Task EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify = false)
    // {
    //     await PatchAsync(id, patch);

    //     // var conversation = _unitOfWork.Conversation.GetById(entity.ConversationId);
    //     // conversation.UpdatedTime = DateTime.Now;
    //     // _unitOfWork.Conversation.Update(conversation);
    //     //await _unitOfWork.SaveAsync();

    //     // if (includeNotify)
    //     // {
    //     //     var contactId = Guid.Parse(_httpContextAccessor.HttpContext.Session.GetString("UserId"));
    //     //     var notify = _mapper.Map<Conversation, ConversationDto>(conversation);
    //     //     foreach (var contact in _unitOfWork.Participant.DbSet.Where(q => q.ConversationId == entity.ConversationId && q.ContactId != contactId).Select(q => q.ContactId.ToString()))
    //     //     {
    //     //         var connection = _notificationService.GetConnection(contact);
    //     //         await _notificationService.NotifyAsync<ConversationDto>(Constants.NotificationEvent_AddMember, connection, notify);
    //     //     }
    //     // }
    // }

    public bool CheckExistConversation(Guid id, Guid fid)
    {
        var result = _unitOfWork.Participant.GetAll()
        .GroupBy(q => q.ConversationId)
        .Any(q => q.Any(w => w.ContactId == id) && q.Any(w => w.ContactId == fid));
        return result;
    }

    // public IEnumerable<ParticipantNoReference> GetByConversationIdIncludeContact(Guid id)
    // {
    //     var entity = _unitOfWork.Participant.DbSet
    //     .Include(q => q.Contact)
    //     .Where(q => q.ConversationId == id)
    //     .ToList();
    //     return _mapper.Map<List<Participant>, List<ParticipantNoReference>>(entity);
    // }
}