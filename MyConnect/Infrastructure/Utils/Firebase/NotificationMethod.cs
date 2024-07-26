namespace Infrastructure.Utils.Firebase;

public class NotificationMethod : INotificationMethod
{
    private readonly IFirebaseFunction _firebaseFunction;

    public NotificationMethod(IFirebaseFunction firebaseFunction)
    {
        _firebaseFunction = firebaseFunction;
    }

    public async Task Notify(string _event, string[] contactIds, object data)
    {
        var connections = new List<string>();
        foreach (var contact in contactIds)
        {
            var token = Utils.RedisCLient.Db.StringGet($"connection-{contact}");
            if (!token.IsNull)
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