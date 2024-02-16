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
            
            if(friend == null)
            friend = new Friend{Status = "new"};
            else if(friend.Status == "request" && friend.ContactId1 == id)
            friend.Status = "request_sent";
            else if (friend.Status == "request" && friend.ContactId2 == id)
            friend.Status = "request_received";            

            return friend;
        }
    }
}