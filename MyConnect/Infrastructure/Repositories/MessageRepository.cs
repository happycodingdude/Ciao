namespace Infrastructure.Repositories;

public class MessageRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Message>(context, uow, httpContextAccessor), IMessageRepository
// public class MessageRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Message>(context, httpContextAccessor), IMessageRepository
{ }