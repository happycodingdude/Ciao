namespace Application.Repositories;

public interface IFriendRepository : IMongoRepository<Friend>
{
    Task<string> GetFriendStatusAsync(Friend friend);
    Task<IEnumerable<GetListFriendItem>> GetListFriend();
}