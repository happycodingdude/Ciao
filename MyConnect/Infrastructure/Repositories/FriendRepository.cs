namespace Infrastructure.Repositories;

// public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
// {
//     // public FriendRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
//     public FriendRepository(MongoDbContext context) : base(context) { }
// }
public class FriendRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : MongoBaseRepository<Friend>(context, uow, httpContextAccessor), IFriendRepository { }