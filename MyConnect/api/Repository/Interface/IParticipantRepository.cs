using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IParticipantRepository : IRepository<Participant>
    {
        IEnumerable<Participant> GetByConversationIdIncludeContact(Guid id);
        IEnumerable<string> GetContactIdByConversationId(Guid id);
    }
}