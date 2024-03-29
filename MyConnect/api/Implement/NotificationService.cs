using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;
using StackExchange.Redis;

namespace MyConnect.Implement
{
    public static class RedisCLient
    {
        private static readonly ConnectionMultiplexer redis;
        public static readonly IDatabase db;

        static RedisCLient()
        {
            redis = ConnectionMultiplexer.Connect("localhost");
            db = redis.GetDatabase();
        }
    }

    public class NotificationService : INotificationService
    {
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificationService(IFirebaseFunction firebaseFunction, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _firebaseFunction = firebaseFunction;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public string GetConnection(string id)
        {
            return RedisCLient.db.StringGet($"connection-{id}");
        }

        public bool RegisterConnection(RegisterConnection param)
        {
            return RedisCLient.db.StringSet($"connection-{param.Id}", param.Token);
        }

        public bool RemoveConnection(string id)
        {
            return RedisCLient.db.KeyDelete($"connection-{id}");
        }

        public async Task Notify(string[] connections)
        {
            foreach (var connection in connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<object>(NotificationEvent.NewNotification, null)
                };
                await _firebaseFunction.Notify(notification);
            }
        }

        public async Task Notify(string[] connections, NotificationDto data)
        {
            foreach (var connection in connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<NotificationDto>(NotificationEvent.NewNotification, data)
                };
                await _firebaseFunction.Notify(notification);
            }
        }

        public IEnumerable<NotificationDto> GetAll(int page, int limit)
        {
            var dtos = new List<NotificationDto>();
            var entities = _unitOfWork.Notification.GetAll(page, limit);
            foreach (var entity in entities)
            {
                switch (entity.SourceType)
                {
                    case NotificationSourceType.FriendRequest:
                        var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint<Friend>>(entity);
                        constraintDto.SourceData = _unitOfWork.Friend.GetById(constraintDto.SourceId);
                        var dto = _mapper.Map<NotificationTypeConstraint<Friend>, NotificationDto>(constraintDto);
                        dtos.Add(dto);
                        break;
                    default:
                        break;
                }
            }
            return dtos;
        }
    }
}