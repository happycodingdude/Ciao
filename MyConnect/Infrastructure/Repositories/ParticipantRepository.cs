
namespace Infrastructure.Repositories;

public class ParticipantRepository : BaseRepository<Participant>, IParticipantRepository
{
    public ParticipantRepository(AppDbContext context) : base(context) { }

    public IEnumerable<Participant> GetByConversationId(Guid conversationId)
    {
        return DbSet.Where(q => q.ConversationId == conversationId);
    }
}