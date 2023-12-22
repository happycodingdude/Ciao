using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IParticipantsService
    {
        Task<IEnumerable<Participants>> AddParticipantAndNotify(List<Participants> model);
        Task<Participants> RemoveChatAndNotify(Participants model);
    }
}