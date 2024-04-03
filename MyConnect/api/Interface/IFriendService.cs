using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IFriendService
    {
        Friend GetByTwoContactId(Guid id, Guid friendId);
        IEnumerable<GetAllFriend> GetAllFriendByContactId(Guid id);
        Task<Friend> AddAsync(Friend model, bool includeNotify);
        Task<Friend> UpdateAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
        Task DeleteAsync(Guid id, bool includeNotify);
    }
}