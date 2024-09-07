namespace Infrastructure.Repositories;

public class ContactRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Contact>(context, uow), IContactRepository { }