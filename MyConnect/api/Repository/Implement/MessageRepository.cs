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

        public IEnumerable<MessageGroupByCreatedTime> GetByConversationId(Guid id)
        {
            var messages = _context.Set<Message>().Where(q => q.ConversationId == id).OrderBy(q => q.CreatedTime).ToList();
            var groupByCreatedTime = messages.GroupBy(q => q.CreatedTime.Value.Date)
            .Select(q => new MessageGroupByCreatedTime
            {
                Date = q.Key.ToShortDateString(),
                Messages = q.ToList()
            });
            return groupByCreatedTime;
        }
    }
}