namespace Application.Notifications;

public class SignalHub : Hub
{
    readonly UserCache _userCache;
    readonly ConversationCache _conversationCache;
    readonly ILogger _logger;

    public SignalHub(UserCache userCache, ConversationCache conversationCache, ILogger logger)
    {
        _userCache = userCache;
        _conversationCache = conversationCache;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (userId is not null)
            {
                _logger.Information($"User {userId} connected with ConnectionId {Context.ConnectionId}");
                var connection = _userCache.GetUserConnection(userId.ToString());
                // Set cache if not exist
                if (connection is null)
                {
                    _logger.Information($"Update cache User {userId} with ConnectionId {Context.ConnectionId}");
                    _userCache.SetUserConnection(userId, Context.ConnectionId);
                    _userCache.SetConnectionUser(userId, Context.ConnectionId);
                }
                var conversationIds = await _conversationCache.GetListConversationId(userId);
                // Add to group for broadcasting
                foreach (var conversationId in conversationIds)
                {
                    _logger.Information($"Add user {userId} to group {conversationId}");
                    await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
                }
            }
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            _logger.Information(JsonConvert.SerializeObject(ex));
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
                _logger.Information($"User {userId} disconnected");
            }
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.Information(JsonConvert.SerializeObject(ex));
        }
    }

    // ✅ **Ensure this method is public and can be invoked from the client**
    public Task<string> GetConnectionId()
    {
        return Task.FromResult(Context.ConnectionId);
    }
}