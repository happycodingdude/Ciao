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
            var participantDbSet = _context.Set<Participants>();

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);

            var entity = _dbSet
            .Where(q => q.Participants.Any(w => w.ContactId == contactId && !w.IsDeleted))
            .OrderByDescending(q => q.UpdatedTime)
            .ToList();
            var conversations = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(entity);
            foreach (var conversation in conversations)
            {
                conversation.UnSeenMessages = messageDbSet.Count(q => q.ConversationId == conversation.Id && q.ContactId != contactId && q.Status == "received");

                var lastMessageEntity = messageDbSet.Where(q => q.ConversationId == conversation.Id).OrderByDescending(q => q.CreatedTime).FirstOrDefault();
                if (lastMessageEntity == null) continue;
                conversation.LastMessageId = lastMessageEntity.Id;
                conversation.LastMessage = lastMessageEntity.Type == "text" ? lastMessageEntity.Content : "";
                conversation.LastMessageTime = lastMessageEntity.CreatedTime;
                conversation.LastMessageContact = lastMessageEntity.ContactId;
                conversation.IsNotifying = participantDbSet.FirstOrDefault(q => q.ConversationId == conversation.Id && q.ContactId == contactId && !q.IsDeleted).IsNotifying;
            }
            return conversations;
        }
    }
}