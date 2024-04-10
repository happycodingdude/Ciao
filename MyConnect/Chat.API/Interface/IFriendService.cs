using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IFriendService : IBaseService<Friend, FriendDto>
    {
        FriendDto GetByTwoContactId(Guid id, Guid friendId);
        IEnumerable<GetAllFriend> GetAllFriendByContactId(Guid id);
        Task<FriendDto> AddAsync(FriendDto model, bool includeNotify);
        Task<FriendDto> UpdateAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
        Task DeleteAsync(Guid id, bool includeNotify);
    }
}