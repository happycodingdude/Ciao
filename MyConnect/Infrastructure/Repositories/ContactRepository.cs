namespace Infrastructure.Repositories;

public class ContactRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Contact>(context, httpContextAccessor), IContactRepository
{ }