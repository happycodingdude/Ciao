namespace Infrastructure.Repositories;

public class ContactRepository : MongoBaseRepository<Contact>, IContactRepository
{
    // public ContactRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
    public ContactRepository(MongoDbContext context) : base(context) { }
}