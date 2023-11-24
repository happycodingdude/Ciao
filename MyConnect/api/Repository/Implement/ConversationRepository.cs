using AutoMapper;
using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        private readonly CoreContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConversationRepository(CoreContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contact = JwtToken.ExtractToken(token);
            var entity = _context.Set<Conversation>()
            .Where(q => q.Participants.Any(w => w.ContactId == contact.Id && !w.IsDeleted))
            .OrderByDescending(q => q.CreatedTime)
            .ToList();
            var result = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(entity);
            foreach (var item in result)
            {
                item.UnSeenMessages = _context.Set<Message>().Count(q => q.ConversationId == item.Id && q.Status == "received");
                item.LastMessage = _context.Set<Message>().Where(q => q.ConversationId == item.Id).OrderByDescending(q => q.CreatedTime).FirstOrDefault()?.Content;
            }
            return result;
        }
    }
}