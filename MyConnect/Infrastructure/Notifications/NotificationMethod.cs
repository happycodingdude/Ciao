namespace Infrastructure.Notifications;

public class NotificationMethod : INotificationMethod
{
    readonly IFirebaseFunction _firebaseFunction;
    readonly IDistributedCache _distributedCache;

    public NotificationMethod(IFirebaseFunction firebaseFunction, IDistributedCache distributedCache)
    {
        _firebaseFunction = firebaseFunction;
        _distributedCache = distributedCache;
    }

    public async Task Notify(string _event, string[] contactIds, object data)
    {
        var connections = new List<string>();
        foreach (var contact in contactIds)
        {
            var token = await _distributedCache.GetStringAsync($"connection-{contact}");
            if (!string.IsNullOrEmpty(token))
                connections.Add(token);
        }
        if (!connections.Any())
        {
            Console.WriteLine("No connection");
            return;
        }
        var notify = new FirebaseNotification
        {
            _event = _event,
            tokens = connections.ToArray(),
            data = data
        };
        await _firebaseFunction.Notify(notify);
    }
}