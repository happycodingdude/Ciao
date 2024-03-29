using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
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

        public Friend GetByTwoContactId(Guid id, Guid fid)
        {
            var friend = _unitOfWork.Friend.GetByTwoContactId(id, fid);

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
                var connection = _notificationService.GetConnection(model.ContactId2.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    RequestId = model.Id
                };
                await Notify(connection, request);

                // Save notification
                var contact = _unitOfWork.Contact.GetById(model.ContactId1);
                var notiEntity = new Notification
                {
                    SourceId = model.Id,
                    SourceType = NotificationSourceType.FriendRequest,
                    Content = $"{contact.Name} send you a request",
                    ContactId = model.ContactId2
                };
                _unitOfWork.Notification.Add(notiEntity);
                _unitOfWork.Save();

                // Send new notification to client
                var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint<Friend>>(notiEntity);
                constraintDto.SourceData = model;
                var dto = _mapper.Map<NotificationTypeConstraint<Friend>, NotificationDto>(constraintDto);
                await _notificationService.Notify(new string[1] { connection }, dto);
            }
            return model;
        }

        public async Task<Friend> UpdateAndNotify(Guid id, JsonPatchDocument patch, bool includeNotify)
        {
            var entity = _unitOfWork.Friend.GetById(id);
            patch.ApplyTo(entity);
            _unitOfWork.Friend.Update(entity);
            _unitOfWork.Save();
            if (includeNotify)
            {
                var connection = _notificationService.GetConnection(entity.ContactId1.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    RequestId = id
                };
                await Notify(connection, request);

                // Send new notification to client
                await _notificationService.Notify(new string[1] { connection });
            }
            return entity;
        }

        public async Task DeleteAndNotify(Guid id, bool includeNotify)
        {
            var entity = _unitOfWork.Friend.GetById(id);
            _unitOfWork.Friend.Delete(id);
            _unitOfWork.Save();
            if (includeNotify)
            {
                var connection = _notificationService.GetConnection(entity.ContactId2.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    ContactId = entity.ContactId1
                };
                await Notify(connection, request);

                // Send new notification to client
                await _notificationService.Notify(new string[1] { connection });
            }
        }

        private async Task Notify(string connection, FriendToNotify data)
        {
            var notification = new FirebaseNotification
            {
                to = connection,
                data = new CustomNotification<FriendToNotify>(NotificationEvent.NewFriendRequest, data)
            };
            await _firebaseFunction.Notify(notification);
        }
    }
}