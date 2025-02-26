namespace Infrastructure.Notifications;

public class WebSocketProcessor : INotificationProcessor
{
    readonly IServiceProvider _serviceProvider;
    readonly IHubContext<SignalHub> _hubContext;
    readonly ILogger _logger;

    public WebSocketProcessor(IServiceProvider serviceProvider, IHubContext<SignalHub> hubContext, ILogger logger)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
        _logger = logger;
    }

    // public async Task Notify(string _event, string[] userIds, object data)
    // {
    //     using var scope = _serviceProvider.CreateScope();
    //     var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

    //     var connections = new Dictionary<string, string>(userIds.Count());
    //     foreach (var id in userIds)
    //     {
    //         var connection = userCache.GetUserConnection(id);
    //         if (!string.IsNullOrEmpty(connection))
    //             connections[id] = connection;
    //     }
    //     if (!connections.Any())
    //     {
    //         _logger.Information("No connection");
    //         return;
    //     }

    //     _logger.Information($"_event => {_event}");
    //     foreach (var connection in connections)
    //     {
    //         _logger.Information($"connection => {connection}");
    //         try
    //         {
    //             await _hubContext.Clients.Client(connection.Value).SendAsync(_event, connection.Key, JsonConvert.SerializeObject(data,
    //                     new JsonSerializerSettings
    //                     {
    //                         ContractResolver = new CamelCasePropertyNamesContractResolver()
    //                     })
    //                 );
    //         }
    //         catch (Exception ex)
    //         {
    //             _logger.Information(JsonConvert.SerializeObject(ex));
    //         }
    //     }
    // }

    public async Task Notify(string _event, string group, string userId, object data)
    {
        // _logger.Information($"group => {group}");
        // _logger.Information($"_event => {_event}");
        // _logger.Information($"userId => {userId}");
        try
        {
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
}