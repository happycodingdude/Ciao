using AutoMapper;
using MyConnect.Authentication;
using MyConnect.Configuration;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.RestApi;
using MyConnect.UOW;
using MyConnect.Util;

namespace MyConnect.Implement
{
    public class NotificationService : BaseService<Notification, NotificationDto>, INotificationService
    {
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationService(INotificationRepository repo,
        IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
        {
            _firebaseFunction = firebaseFunction;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetConnection(string id)
        {
            return RedisCLient.Db.StringGet($"connection-{id}");
        }

        public bool RegisterConnection(RegisterConnection param)
        {
            return RedisCLient.Db.StringSet($"connection-{param.Id}", param.Token);
        }

        public bool RemoveConnection(string id)
        {
            return RedisCLient.Db.KeyDelete($"connection-{id}");
        }

        public async Task Notify(string _event, string connection)
        {
            var notification = new FirebaseNotification
            {
                to = connection,
                data = new CustomNotification<object>(_event, null)
            };
            await _firebaseFunction.Notify(notification);
        }

        public async Task Notify<T>(string _event, string connection, T data) where T : class
        {
            var notification = new FirebaseNotification
            {
                to = connection,
                data = new CustomNotification<T>(_event, data)
            };
            await _firebaseFunction.Notify(notification);
        }

        public IEnumerable<NotificationTypeConstraint> GetAllNotification(int page, int limit)
        {
            var result = new List<NotificationTypeConstraint>();

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var id = JwtToken.ExtractToken(token);
            var entities = _unitOfWork.Notification.DbSet.Where(q => q.ContactId == id).OrderByDescending(q => q.CreatedTime).Skip(limit * (page - 1)).Take(limit).ToList();
            foreach (var entity in entities)
            {
                switch (entity.SourceType)
                {
                    case NotificationSourceType.FriendRequest:
                        var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint>(entity);
                        var friend = _unitOfWork.Friend.GetById(constraintDto.SourceId);
                        constraintDto.AddSourceData<FriendDto>(_mapper.Map<Friend, FriendDto>(friend));
                        result.Add(constraintDto);
                        break;
                    default:
                        break;
                }
            }
            return result;
        }
    }
}