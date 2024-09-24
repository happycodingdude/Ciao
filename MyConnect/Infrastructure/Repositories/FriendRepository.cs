namespace Infrastructure.Repositories;

// public class FriendRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Friend>(context, uow, httpContextAccessor), IFriendRepository
// { }
public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    public FriendRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : base(context, uow, httpContextAccessor)
    {
        UserWarehouseDB();
    }
}