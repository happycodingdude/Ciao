namespace Infrastructure.Repositories;

public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    public FriendRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
    {
        UserWarehouseDB();
    }
}