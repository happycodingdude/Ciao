namespace Infrastructure.Notifications;

public class FirebaseFunction : IFirebaseFunction
{
    readonly IServiceProvider _serviceProvider;
    readonly ILogger _logger;

    public FirebaseFunction(IServiceProvider serviceProvider, ILogger logger)
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile($"{AppContext.BaseDirectory}/service-account-config.json")
        });
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Notify(string _event, string[] contactIds, object data)
    {
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        var connections = new List<string>();
        foreach (var id in contactIds)
        {
            var token = await userCache.GetUserConnection(id);
            if (!string.IsNullOrEmpty(token))
                connections.Add(token);
        }
        if (!connections.Any())
        {
            _logger.Information("No connection");
            return;
        }
        var notification = new FirebaseNotification
        {
            _event = _event,
            tokens = connections.ToArray(),
            data = data
        };
        var message = new MulticastMessage()
        {
            Tokens = notification.tokens,
            Notification = new FirebaseAdmin.Messaging.Notification()
            {
                Title = notification.title,
                Body = notification.body
            },
            Data = new Dictionary<string, string>()
            {
                { "event", notification._event },
                { "data", JsonConvert.SerializeObject(notification.data,
                    new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    })
                }
            }
        };
        var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
        _logger.Information(JsonConvert.SerializeObject(response));
    }
}