namespace Chat.API.Repository;

public class FriendRepository : BaseRepository<Friend>, IFriendRepository
{
    public FriendRepository(CoreContext context) : base(context) { }
}