using Google.Cloud.Storage.V1;

namespace Infrastructure.Notifications;

public class FirebaseFunction : IFirebaseFunction
{
    readonly IServiceProvider _serviceProvider;
    readonly ILogger _logger;
    readonly StorageClient _storageClient;
    const string BucketName = "myconnect-f2af8.appspot.com";

    public FirebaseFunction(IServiceProvider serviceProvider, ILogger logger)
    {
        var credential = GoogleCredential.FromFile(
            $"{AppContext.BaseDirectory}/service-account-config.json"
        );
        FirebaseApp.Create(new AppOptions()
        {
            Credential = credential
        });
        _serviceProvider = serviceProvider;
        _logger = logger;

        _storageClient = StorageClient.Create(credential);
    }

    public async Task Notify(string _event, string[] userIds, object data)
    {
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        var connections = new List<string>();
        foreach (var id in userIds)
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

    public Task Notify(string _event, string userId, object data)
    {
        throw new NotImplementedException();
    }

    public Task Notify(string _event, string group, string userId, object data)
    {
        throw new NotImplementedException();
    }

    public Task Notify(string _event, string group, string uniqueId, string userId, object data)
    {
        throw new NotImplementedException();
    }

    public async Task<Google.Apis.Storage.v1.Data.Object> UploadAsync(UploadModel model)
    {
        return await _storageClient.UploadObjectAsync(
            bucket: BucketName,
            objectName: model.Folder,
            contentType: model.ContentType,
            source: model.FileStream
        );
    }
}