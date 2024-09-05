
namespace Infrastructure.Repositories;

// public class ParticipantRepository(AppDbContext context) : BaseRepository<Participant>(context), IParticipantRepository
// {
//     public IEnumerable<Participant> GetByConversationId(Guid conversationId)
//     {
//         return DbSet.Where(q => q.ConversationId == conversationId);
//     }
// }
public class ParticipantRepository : MongoBaseRepository<Participant>, IParticipantRepository
{
    public ParticipantRepository(MongoDbContext context) : base(context) { }
}