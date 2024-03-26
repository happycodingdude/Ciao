using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IParticipantService
    {
        Task<IEnumerable<Participant>> AddParticipantAndNotify(Guid id, List<Participant> model);
        Task<Participant> EditParticipantAndNotify(Participant model);
        Participant RemoveChat(Participant model);
        bool CheckExistConversation(Guid id, Guid fid);
    }
}