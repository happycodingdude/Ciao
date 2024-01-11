using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IMessageRepository : IRepository<Message>
    {
        IEnumerable<MessageNoReference> GetWithPaging(Guid id, int page, int limit);
    }
}