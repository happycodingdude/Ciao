using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IConversationRepository : IRepository<Conversation>
    {
        Conversation GetByIdIncludeDetails(Guid id);
    }
}