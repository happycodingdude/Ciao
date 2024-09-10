namespace Infrastructure.Repositories;

public class ContactRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : MongoBaseRepository<Contact>(context, uow, httpContextAccessor), IContactRepository { }