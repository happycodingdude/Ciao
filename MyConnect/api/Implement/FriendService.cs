using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class FriendService : IFriendService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FriendService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Friend GetByIds(Guid id, Guid fid)
        {
            var friend = _unitOfWork.Friend
            .GetAll()
            .FirstOrDefault(q => (q.ContactId1 == id && q.ContactId2 == fid) || (q.ContactId1 == fid && q.ContactId2 == id));

            if (friend == null)
                friend = new Friend { Status = "new" };
            else if (friend.Status == "request" && friend.ContactId1 == id)
                friend.Status = "request_sent";
            else if (friend.Status == "request" && friend.ContactId2 == id)
                friend.Status = "request_received";

            return friend;
        }

        public IEnumerable<GetAllFriend> GetAllFriend(Guid id)
        {
            var result = new List<GetAllFriend>();
            var friends = _unitOfWork.Friend
            .GetAll()
            .Where(q => q.Status == "friend" && (q.ContactId1 == id || q.ContactId2 == id));
            foreach (var friend in friends)
                result.Add(new GetAllFriend
                {
                    Id = friend.Id,
                    ContactId = friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1,
                    ContactName = _unitOfWork.Contact.GetById(friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1).Name
                });
            return result;
        }
    }
}