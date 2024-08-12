namespace Infrastructure.Repositories;

public class FriendRepository(AppDbContext context) : BaseRepository<Friend>(context), IFriendRepository { }