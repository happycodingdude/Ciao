using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        private readonly CoreContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MessageRepository(CoreContext context, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public IEnumerable<MessageGroupByCreatedTime> GetByConversationId(Guid id)
        {
            var messages = _context.Set<Message>()
            .Where(q => q.ConversationId == id)
            .OrderBy(q => q.CreatedTime)
            .ToList();
            UpdateStatus(messages);
            var groupByCreatedTime = messages
            .GroupBy(q => q.CreatedTime.Value.Date)
            .Select(q => new MessageGroupByCreatedTime
            {
                Date = q.Key.ToShortDateString(),
                Messages = q.ToList()
            });
            return groupByCreatedTime;
        }

        private void UpdateStatus(List<Message> messages)
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contact = JwtToken.ExtractToken(token);

            var unseenMessages = messages.Where(q => q.ContactId != contact.Id && q.Status == "received");
            foreach (var message in unseenMessages)
                message.Status = "seen";
            _context.Set<Message>().UpdateRange(unseenMessages);
            _context.SaveChanges();
        }
    }
}