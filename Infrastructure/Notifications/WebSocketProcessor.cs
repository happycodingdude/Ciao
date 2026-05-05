namespace Infrastructure.Notifications;

public class WebSocketProcessor : INotificationProcessor
{
    readonly IServiceProvider _serviceProvider;
    readonly IHubContext<SignalHub> _hubContext;
    readonly ILogger _logger;
    readonly IRedisCaching _redisCaching;

    public WebSocketProcessor(IServiceProvider serviceProvider, IHubContext<SignalHub> hubContext, ILogger logger, IRedisCaching redisCaching)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
        _logger = logger;
        _redisCaching = redisCaching;
    }

    public async Task Notify(string _event, string userId, object data)
    {
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        var connection = await userCache.GetUserConnection(userId);
        if (userId is null)
        {
            _logger.Information("No connection");
            return;
        }

        try
        {
            await _hubContext.Clients.Client(connection).SendAsync(_event, userId, JsonConvert.SerializeObject(data,
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                })
            );
        }
        catch (Exception ex)
        {
            _logger.Information(JsonConvert.SerializeObject(ex));
        }
    }

    public async Task Notify(string _event, string group, string userId, object data)
    {
        try
        {
            _logger.Information($"Notify: event={_event}, group={group}");

            await _hubContext.Clients.Group(group).SendAsync(_event, userId, JsonConvert.SerializeObject(data,
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                })
            );
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "");
        }
    }

    public async Task Notify(string _event, string group, string uniqueId, string userId, object data)
    {
        try
        {
            // Idempotency guard cho notify: nếu cùng (group, uniqueId) đã được gửi trong 2 phút thì skip.
            // Lý do: 1 sự kiện có thể được phát lại từ nhiều consumer (Kafka redelivery, retry tầng app),
            // nếu broadcast trùng → user nhận thông báo nhân đôi.
            // Dùng Redis SET NX (atomic) làm distributed lock nhẹ — không cần lock app-level.
            var key = $"notify:{group}:{uniqueId}";

            var set = await _redisCaching.SetAsync(key, "1", TimeSpan.FromMinutes(2), When.NotExists);
            if (!set)
            {
                _logger.Debug($"Skipping duplicate notify for {key}");
                return; // đã gửi rồi -> skip
            }

            await _hubContext.Clients.Group(group).SendAsync(_event, userId, JsonConvert.SerializeObject(data,
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                })
            );
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "");
        }
    }

    public Task Notify(string _event, string[] userIds, object data)
    {
        throw new NotImplementedException();
    }
}