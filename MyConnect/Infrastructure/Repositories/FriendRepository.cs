namespace Infrastructure.Repositories;

public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    public FriendRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
}