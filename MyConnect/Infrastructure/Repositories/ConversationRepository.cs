namespace Infrastructure.Repositories;

public class ConversationRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Conversation>(context, httpContextAccessor), IConversationRepository
{ }