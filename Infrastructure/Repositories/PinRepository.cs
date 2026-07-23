namespace Infrastructure.Repositories;

public class PinRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Pin>(context, uow), IPinRepository { }
