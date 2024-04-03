using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IFriendRepository : IRepository<Friend>
    {
        IEnumerable<Friend> GetAllByContactId(Guid id);
        Friend GetByTwoContactId(Guid id, Guid friendId);
    }
}