namespace Infrastructure.Repositories;

public class FriendRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Friend>(context, httpContextAccessor), IFriendRepository
{ }