using System.Collections.Concurrent;

namespace Infrastructure.Notifications;

public class SignalHub : Hub, ISignalHub
{
    readonly IServiceProvider _serviceProvider;

    public SignalHub(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    private static readonly ConcurrentDictionary<string, string> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"];
        if (userId is not null)
        {
            UserConnections[userId] = Context.ConnectionId;
            Console.WriteLine($"User {userId} connected with ConnectionId {Context.ConnectionId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = UserConnections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
        if (userId is not null)
        {
            UserConnections.TryRemove(userId, out _);
            Console.WriteLine($"User {userId} disconnected");
        }
        await base.OnDisconnectedAsync(exception);
    }

    // ✅ **Ensure this method is public and can be invoked from the client**
    public Task<string> GetConnectionId()
    {
        return Task.FromResult(Context.ConnectionId);
    }

    public async Task Notify(string _event, string[] contactIds, object data)
    {
        using var scope = _serviceProvider.CreateScope();
        var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

        var connections = new List<string>();
        foreach (var id in contactIds)
        {
            var token = userCache.GetConnection(id);
            if (!string.IsNullOrEmpty(token))
                connections.Add(token);
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
            // await Clients.Client(connection).SendAsync(_event, JsonConvert.SerializeObject(data,
            //         new JsonSerializerSettings
            //         {
            //             ContractResolver = new CamelCasePropertyNamesContractResolver()
            //         })
            //     );
            try
            {
                await Clients.Client(connection).SendAsync(_event, "new message coming");
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }
        }

        // var connections = new List<string>();
        // foreach (var id in contactIds)
        // {
        //     var token = userCache.GetConnection(id);
        //     if (!string.IsNullOrEmpty(token))
        //         connections.Add(token);
        // }
        // if (!connections.Any())
        // {
        //     Console.WriteLine("No connection");
        //     return;
        // }
        // var notification = new FirebaseNotification
        // {
        //     _event = _event,
        //     tokens = connections.ToArray(),
        //     data = data
        // };
        // var message = new MulticastMessage()
        // {
        //     Tokens = notification.tokens,
        //     Notification = new FirebaseAdmin.Messaging.Notification()
        //     {
        //         Title = notification.title,
        //         Body = notification.body
        //     },
        //     Data = new Dictionary<string, string>()
        //     {
        //         { "event", notification._event },
        //         { "data", JsonConvert.SerializeObject(notification.data,
        //             new JsonSerializerSettings
        //             {
        //                 ContractResolver = new CamelCasePropertyNamesContractResolver()
        //             })
        //         }
        //     }
        // };
        // var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
        // Console.WriteLine(JsonConvert.SerializeObject(response));
    }
}