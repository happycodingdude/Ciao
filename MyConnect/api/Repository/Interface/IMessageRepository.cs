using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IMessageRepository : IRepository<Message>
    {
        IEnumerable<Message> GetByConversationId(Guid id);
    }
}