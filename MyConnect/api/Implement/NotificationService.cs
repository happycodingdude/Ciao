using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
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

        public NotificationService(IFirebaseFunction firebaseFunction)
        {
            _firebaseFunction = firebaseFunction;
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

        public async Task Notify(string[] connections, NotificationToNotify data)
        {
            foreach (var connection in connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification(NotificationEvent.NewNotification, data)
                };
                await _firebaseFunction.Notify(notification);
            }
        }
    }
}