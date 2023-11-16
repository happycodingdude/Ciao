using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IParticipantsRepository : IRepository<Participants>
    {
        IEnumerable<Participants> GetByConversationIdIncludeContact(Guid id);
        IEnumerable<Participants> GetByConversationId(Guid id);
    }
}