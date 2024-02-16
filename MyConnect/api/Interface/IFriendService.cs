using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IFriendService
    {
        Friend GetByIds(Guid id, Guid fid);
    }
}