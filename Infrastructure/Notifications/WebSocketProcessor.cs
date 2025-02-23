namespace Infrastructure.Notifications;

public class WebSocketProcessor : INotificationProcessor
{
    readonly IServiceProvider _serviceProvider;
    readonly IHubContext<SignalHub> _hubContext;

    public WebSocketProcessor(IServiceProvider serviceProvider, IHubContext<SignalHub> hubContext)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
    }

    public async Task Notify(string _event, string[] userIds, object data)
    {
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        var connections = new Dictionary<string, string>(userIds.Count());
        foreach (var id in userIds)
        {
            var connection = userCache.GetUserConnection(id);
            if (!string.IsNullOrEmpty(connection))
                connections[id] = connection;
        }
        if (!connections.Any())
        {
            Console.WriteLine("No connection");
            return;
        }

        Console.WriteLine($"_event => {_event}");
        foreach (var connection in connections)
        {
            Console.WriteLine($"connection => {connection}");
            try
            {
                await _hubContext.Clients.Client(connection.Value).SendAsync(_event, connection.Key, JsonConvert.SerializeObject(data,
                        new JsonSerializerSettings
                        {
                            ContractResolver = new CamelCasePropertyNamesContractResolver()
                        })
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }
        }
    }

    public async Task Notify(string _event, string group, string userId, object data)
    {
        Console.WriteLine($"group => {group}");
        Console.WriteLine($"_event => {_event}");
        Console.WriteLine($"userId => {userId}");
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
            Console.WriteLine(JsonConvert.SerializeObject(ex));
        }
    }
}