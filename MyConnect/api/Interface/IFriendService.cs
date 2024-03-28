using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IFriendService
    {
        Friend GetByTwoContactId(Guid id, Guid fid);
        IEnumerable<GetAllFriend> GetAllFriend(Guid id);
        Task<Friend> AddAndNotify(Friend model, bool includeNotify);
        Task<Friend> UpdateAndNotify(Guid id, JsonPatchDocument patch, bool includeNotify);
        Task DeleteAndNotify(Guid id, bool includeNotify);
    }
}