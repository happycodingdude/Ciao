using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class FriendService : IFriendService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly IMapper _mapper;

        public FriendService(IUnitOfWork unitOfWork, INotificationService notificationService, IFirebaseFunction firebaseFunction, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _firebaseFunction = firebaseFunction;
            _mapper = mapper;
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

        public async Task<Friend> AddAndNotify(Friend model, bool includeNotify)
        {
            _unitOfWork.Friend.Add(model);
            _unitOfWork.Save();
            if (includeNotify)
            {
                var contact = _unitOfWork.Contact.GetById(model.ContactId1);
                var noti = new Notification
                {
                    SourceType = NotificationSourceType.FriendRequest,
                    Content = $"{contact.Name} send you a request",
                    ContactId = model.ContactId2
                };
                _unitOfWork.Notification.Add(noti);
                _unitOfWork.Save();

                var notify = _mapper.Map<Notification, NotificationToNotify>(noti);
                var connection = _notificationService.GetConnection(model.ContactId2.ToString());
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification(NotificationEvent.NewFriendRequest, notify)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }
    }
}