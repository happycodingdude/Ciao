using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        private readonly CoreContext _context;

        public ConversationRepository(CoreContext context) : base(context)
        {
            _context = context;
        }

        public Conversation GetByIdIncludeDetails(Guid id)
        {
            var entity = _context.Set<Conversation>().Find(id);
            _context.Entry(entity).Collection(q => q.Participants).Load();
            _context.Entry(entity).Collection(q => q.Messages).Load();
            return entity;
        }
    }
}