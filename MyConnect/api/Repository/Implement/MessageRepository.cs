using MyConnect.Model;

namespace MyConnect.Repository
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        private readonly CoreContext _context;

        public MessageRepository(CoreContext context) : base(context)
        {
            _context = context;
        }

        public IEnumerable<Message> GetByConversationId(Guid id)
        {
            return _context.Set<Message>().Where(q => q.ConversationId == id).OrderBy(q => q.CreatedTime).ToList();
        }
    }
}