namespace Infrastructure.Repositories;

public class PinnedMessageRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<PinnedMessage>(context, uow), IPinnedMessageRepository { }
