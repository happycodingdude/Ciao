using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IConversationRepository : IRepository<Conversation>
    {
        IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages();
    }
}