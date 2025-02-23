namespace Application.Notifications;

public class SignalHub : Hub
{
    // static readonly ConcurrentDictionary<string, string> UserConnections = new();    
    readonly UserCache _userCache;
    readonly ConversationCache _conversationCache;

    public SignalHub(UserCache userCache, ConversationCache conversationCache)
    {
        _userCache = userCache;
        _conversationCache = conversationCache;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (userId is not null)
            {
                Console.WriteLine($"User {userId} connected with ConnectionId {Context.ConnectionId}");
                // UserConnections[userId] = Context.ConnectionId;
                _userCache.SetUserConnection(userId, Context.ConnectionId);
                _userCache.SetConnectionUser(userId, Context.ConnectionId);
                var conversationIds = await _conversationCache.GetListConversationId(userId);
                // Add to group for broadcasting
                foreach (var conversationId in conversationIds)
                {
                    Console.WriteLine($"Add user {userId} to group {conversationId}");
                    await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
                }
            }
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(JsonConvert.SerializeObject(ex));
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = _userCache.GetConnectionUser(Context.ConnectionId);
            if (userId is not null)
            {
                await _userCache.RemoveConnection(userId, Context.ConnectionId);
                Console.WriteLine($"User {userId} disconnected");
            }
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            Console.WriteLine(JsonConvert.SerializeObject(ex));
        }
    }

    // ✅ **Ensure this method is public and can be invoked from the client**
    public Task<string> GetConnectionId()
    {
        return Task.FromResult(Context.ConnectionId);
    }
}