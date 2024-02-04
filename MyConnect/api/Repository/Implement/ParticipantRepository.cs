using Microsoft.EntityFrameworkCore;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ParticipantRepository : BaseRepository<Participant>, IParticipantRepository
    {
        public ParticipantRepository(CoreContext context) : base(context)
        {
        }

        public IEnumerable<Participant> GetByConversationIdIncludeContact(Guid id)
        {
            return _dbSet
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id && !q.IsDeleted)
            .ToList();
        }

        public IEnumerable<string> GetContactIdByConversationId(Guid id)
        {
            return _dbSet            
            .Where(q => q.ConversationId == id)
            .Select(q => q.ContactId.ToString())
            .ToList();
        }
    }
}