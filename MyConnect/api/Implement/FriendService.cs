using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Authentication;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.RestApi;
using MyConnect.UOW;
using MyConnect.Util;

namespace MyConnect.Implement
{
    public class FriendService : BaseService<Friend, FriendDto>, IFriendService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FriendService(IFriendRepository repo,
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public override FriendDto GetById(Guid id)
        {
            var entity = _unitOfWork.Friend.DbSet.Find(id);
            if (entity == null) return null;

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);

            if (entity == null)
                entity = new Friend { Status = "new" };
            else if (entity.Status == "request" && entity.ContactId1 == contactId)
                entity.Status = "request_sent";
            else if (entity.Status == "request" && entity.ContactId2 == contactId)
                entity.Status = "request_received";

            return _mapper.Map<Friend, FriendDto>(entity);
        }

        public FriendDto GetByTwoContactId(Guid id, Guid friendId)
        {
            var entity = _unitOfWork.Friend.DbSet.FirstOrDefault(q => (q.ContactId1 == id && q.ContactId2 == friendId) || (q.ContactId1 == friendId && q.ContactId2 == id));
            var dto = _mapper.Map<Friend, FriendDto>(entity);

            if (dto == null)
                dto = new FriendDto { Status = "new" };
            else if (dto.Status == "request" && dto.ContactId1 == id)
                dto.Status = "request_sent";
            else if (dto.Status == "request" && dto.ContactId2 == id)
                dto.Status = "request_received";

            return dto;
        }

        public IEnumerable<GetAllFriend> GetAllFriendByContactId(Guid id)
        {
            var result = new List<GetAllFriend>();
            var friends = _unitOfWork.Friend.DbSet.Where(q => (q.ContactId1 == id || q.ContactId2 == id) && q.Status == "friend").ToList();
            foreach (var friend in friends)
                result.Add(new GetAllFriend
                {
                    Id = friend.Id,
                    ContactId = friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1,
                    ContactName = _unitOfWork.Contact.GetById(friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1).Name
                });
            return result;
        }

        public async Task<FriendDto> AddAsync(FriendDto model, bool includeNotify)
        {
            Add(model);

            if (includeNotify)
            {
                var connection = _notificationService.GetConnection(model.ContactId2.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    RequestId = model.Id
                };
                await _notificationService.Notify(NotificationEvent.NewFriendRequest, connection, request);

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
                var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint<FriendDto>>(notiEntity);
                constraintDto.SourceData = model;
                var dto = _mapper.Map<NotificationTypeConstraint<FriendDto>, NotificationDto>(constraintDto);
                await _notificationService.Notify(NotificationEvent.NewNotification, connection, dto);
            }
            return model;
        }

        public async Task<FriendDto> UpdateAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
        {
            var result = Patch(id, patch);

            if (includeNotify)
            {
                var connection = _notificationService.GetConnection(result.ContactId1.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    RequestId = id
                };
                await _notificationService.Notify(NotificationEvent.AcceptFriendRequest, connection, request);
            }
            return result;
        }

        public async Task DeleteAsync(Guid id, bool includeNotify)
        {
            var entity = _unitOfWork.Friend.GetById(id);
            Delete(id);
            if (includeNotify)
            {
                var connection = _notificationService.GetConnection(entity.ContactId2.ToString());

                // Send updated request to client
                var request = new FriendToNotify
                {
                    ContactId = entity.ContactId1
                };
                await _notificationService.Notify(NotificationEvent.CancelFriendRequest, connection, request);

                // Send new notification to client                
                await _notificationService.Notify(NotificationEvent.NewNotification, connection);
            }
        }
    }
}