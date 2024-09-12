namespace Infrastructure.Repositories;

public class MessageRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Message>(context, httpContextAccessor), IMessageRepository
{ }