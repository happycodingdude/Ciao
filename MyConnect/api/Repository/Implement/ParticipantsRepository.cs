using Microsoft.EntityFrameworkCore;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ParticipantsRepository : BaseRepository<Participants>, IParticipantsRepository
    {
        private readonly CoreContext _context;

        public ParticipantsRepository(CoreContext context) : base(context)
        {
            _context = context;
        }

        public IEnumerable<Participants> GetByConversationIdIncludeContact(Guid id)
        {
            return _context.Set<Participants>()
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id)
            .ToList();
        }

        public IEnumerable<Participants> GetByConversationId(Guid id)
        {
            return _context.Set<Participants>().Where(q => q.ConversationId == id).ToList();
        }
    }
}