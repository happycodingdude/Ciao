using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IMessageRepository : IRepository<Message>
    {
        IEnumerable<MessageNoReference> GetByConversationIdWithPaging(Guid id, int page, int limit);
    }
}