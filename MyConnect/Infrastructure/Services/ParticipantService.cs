namespace Infrastructure.Services;

// public class ParticipantService(IParticipantRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
//     : BaseService<Participant, ParticipantDto>(repo, unitOfWork, mapper), IParticipantService
// {
//     // public bool CheckExistConversation(Guid id, Guid fid)
//     // {
//     //     var result = _unitOfWork.Participant.GetAll()
//     //     .GroupBy(q => q.ConversationId)
//     //     .Any(q => q.Any(w => w.ContactId == id) && q.Any(w => w.ContactId == fid));
//     //     return result;
//     // }
// }