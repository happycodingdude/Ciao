using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IContactService
    {
        Contact GetByFriendId2(Guid id);
    }
}