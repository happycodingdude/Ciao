namespace Infrastructure.Repositories;

public class MessageRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Message>(context, uow), IMessageRepository { }