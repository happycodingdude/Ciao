namespace Infrastructure.Repositories;

public class ContactRepository : MongoBaseRepository<Contact>, IContactRepository
{
    public ContactRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
}