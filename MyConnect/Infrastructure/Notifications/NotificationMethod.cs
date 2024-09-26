namespace Infrastructure.Notifications;

public class NotificationMethod(IFirebaseFunction firebaseFunction, IDistributedCache distributedCache) : INotificationMethod
{
    public async Task Notify(string _event, string[] contactIds, object data)
    {
        var connections = new List<string>();
        foreach (var id in contactIds)
        {
            var token = await distributedCache.GetStringAsync($"connection-{id}");
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
        await firebaseFunction.Notify(notify);
    }
}