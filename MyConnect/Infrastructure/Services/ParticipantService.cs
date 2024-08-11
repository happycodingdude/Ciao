namespace Infrastructure.Services;

public class ParticipantService : BaseService<Participant, ParticipantDto>, IParticipantService
{
    public ParticipantService(IParticipantRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }

    // public bool CheckExistConversation(Guid id, Guid fid)
    // {
    //     var result = _unitOfWork.Participant.GetAll()
    //     .GroupBy(q => q.ConversationId)
    //     .Any(q => q.Any(w => w.ContactId == id) && q.Any(w => w.ContactId == fid));
    //     return result;
    // }
}