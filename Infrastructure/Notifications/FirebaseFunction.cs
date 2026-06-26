using Firebase.Storage;

namespace Infrastructure.Notifications;

public class FirebaseFunction : IFirebaseFunction
{
    readonly IServiceProvider _serviceProvider;
    readonly ILogger _logger;
    readonly FirebaseStorage _storage;
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

        _storage = new FirebaseStorage(BucketName);
    }

    public async Task Notify(string _event, string[] userIds, object data)
    {
        // FirebaseFunction là singleton, nhưng UserCache là scoped → phải tự tạo scope để resolve.
        // Không dùng class-level _userCache vì sẽ bị captive dependency (singleton giữ scoped instance vĩnh viễn).
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        // Giữ cặp (userId, token) để còn phân nhóm banner/data-only theo preference của TỪNG người.
        // Lookup tuần tự (N round-trip Redis) — N nhỏ (vài chục member) thì ổn; group lớn cân nhắc MGET.
        var pairs = new List<(string userId, string token)>();
        foreach (var id in userIds)
        {
            var token = await userCache.GetUserConnection(id);
            if (!string.IsNullOrEmpty(token))
                pairs.Add((id, token));
        }
        if (pairs.Count == 0)
        {
            _logger.Information("No connection");
            return;
        }

        // Event sync (delivered/read/edited/...) không bao giờ có banner → 1 lần gửi, data-only.
        // Vừa đúng ý nghĩa (không phải push), vừa dẹp banner "Ciao notify" rác cho receipt.
        if (!NotificationPolicy.IsBannerable(_event))
        {
            await SendMulticast(_event, pairs.Select(p => p.token).ToArray(), data, banner: false);
            return;
        }

        // Event user-facing: đọc ContactSettings (kèm trong user-info cache) để phân nhóm.
        // GetInfo chỉ trả những user có trong cache → user vắng cache rơi vào fail-open (vẫn banner).
        var infoMap = (await userCache.GetInfo(pairs.Select(p => p.userId).ToArray()))
            .Where(c => c is not null)
            .ToDictionary(c => c.Id);

        var bannerTokens = new List<string>();
        var dataOnlyTokens = new List<string>();
        foreach (var (userId, token) in pairs)
        {
            infoMap.TryGetValue(userId, out var contact);
            (NotificationPolicy.ShouldShowBanner(_event, contact?.Settings) ? bannerTokens : dataOnlyTokens)
                .Add(token);
        }

        if (bannerTokens.Count > 0)
            await SendMulticast(_event, bannerTokens.ToArray(), data, banner: true);
        if (dataOnlyTokens.Count > 0)
            await SendMulticast(_event, dataOnlyTokens.ToArray(), data, banner: false);
    }

    // Gửi 1 multicast. banner=false → bỏ block Notification (title/body) ⇒ KHÔNG hiện banner OS,
    // nhưng vẫn gửi block Data nên realtime FE (onMessage / SW postMessage) hoạt động bình thường.
    async Task SendMulticast(string _event, string[] tokens, object data, bool banner)
    {
        var notification = new FirebaseNotification
        {
            _event = _event,
            tokens = tokens,
            data = data
        };
        // Banner OS: derive title/body có nghĩa (sender + preview) từ payload, thay chuỗi cứng.
        // Chỉ tính khi banner=true để khỏi tốn công cho nhóm data-only.
        if (banner)
            (notification.title, notification.body) = NotificationBanner.Build(_event, data);
        var message = new MulticastMessage()
        {
            Tokens = notification.tokens,
            Notification = banner
                ? new FirebaseAdmin.Messaging.Notification()
                {
                    Title = notification.title,
                    Body = notification.body
                }
                : null,
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

    public async Task<string> UploadAsync(UploadModel model)
    {
        var storageTask = _storage
            .Child(model.Folder)
            .Child(model.FileName)
            .PutAsync(model.FileStream); // Upload the stream

        // Optional: Monitor the upload progress
        storageTask.Progress.ProgressChanged += (s, e) =>
        {
            Console.WriteLine($"Progress: {e.Percentage} %");
        };

        try
        {
            // Wait for the upload to complete and get the download URL
            string downloadUrl = await storageTask;
            return downloadUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error uploading file: {ex.Message}");
            throw;
        }
    }
}