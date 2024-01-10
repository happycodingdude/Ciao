using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IParticipantService
    {
        Task<IEnumerable<Participant>> AddParticipantAndNotify(List<Participant> model);
        Task<Participant> RemoveChatAndNotify(Participant model);
    }
}