namespace Infrastructure.Repositories;

//public class ConversationRepository(AppDbContext context) : BaseRepository<Conversation>(context), IConversationRepository { }
public class ConversationRepository : MongoBaseRepository<Conversation>, IConversationRepository
{
    public ConversationRepository(MongoDbContext context) : base(context) { }
}