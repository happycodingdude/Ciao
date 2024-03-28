using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IFriendRepository : IRepository<Friend>
    {
        Friend GetByTwoContactId(Guid id, Guid fid);
    }
}