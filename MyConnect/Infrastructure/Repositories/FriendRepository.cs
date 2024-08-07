namespace Infrastructure.Repositories;

public class FriendRepository : BaseRepository<Friend>, IFriendRepository
{
    public FriendRepository(AppDbContext context) : base(context) { }
}