using Microsoft.EntityFrameworkCore;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ParticipantsRepository : BaseRepository<Participants>, IParticipantsRepository
    {
        public ParticipantsRepository(CoreContext context) : base(context)
        {
        }

        public IEnumerable<Participants> GetByConversationIdIncludeContact(Guid id)
        {
            return _dbSet
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id && !q.IsDeleted)
            .ToList();
        }
    }
}