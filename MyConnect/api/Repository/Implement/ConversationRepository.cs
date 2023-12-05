using AutoMapper;
using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConversationRepository(CoreContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages()
        {
            var messageDbSet = _context.Set<Message>();
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contact = JwtToken.ExtractToken(token);
            var entity = _dbSet
            .Where(q => q.Participants.Any(w => w.ContactId == contact.Id && !w.IsDeleted))
            .OrderByDescending(q => q.UpdatedTime)
            .ToList();
            var result = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(entity);
            foreach (var item in result)
            {
                item.UnSeenMessages = messageDbSet.Count(q => q.ConversationId == item.Id && q.ContactId != contact.Id && q.Status == "received");

                var lastMessageEntity = messageDbSet.Where(q => q.ConversationId == item.Id).OrderByDescending(q => q.CreatedTime).FirstOrDefault();
                if (lastMessageEntity == null) continue;
                item.LastMessage = lastMessageEntity.Type == "text" ? lastMessageEntity.Content : lastMessageEntity.MediaUrl;
                item.LastMessageTime = lastMessageEntity.CreatedTime;
                item.LastMessageContact = lastMessageEntity.ContactId;
            }
            return result;
        }
    }
}