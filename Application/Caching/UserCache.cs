namespace Application.Caching;

public class UserCache
{
    readonly IRedisCaching _redisCaching;
    readonly IHttpContextAccessor _httpContextAccessor;

    public UserCache(IRedisCaching redisCaching, IHttpContextAccessor httpContextAccessor)
    {
        _redisCaching = redisCaching;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public async Task<string> GetToken(string userId) => await _redisCaching.GetAsync<string>($"user-{userId}-token");

    public void SetToken(string userId, string token) => _ = _redisCaching.SetAsync($"user-{userId}-token", token);

    public async Task<string> GetUserConnection(string userId) => await _redisCaching.GetAsync<string>($"user-{userId}-connection");

    public async Task<List<string>> GetUserConnection(string[] userIds)
    {
        var result = new List<string>();
        // Query info cache
        var tasks = userIds.Select(async userId =>
        {
            var connection = await _redisCaching.GetAsync<string>($"user-{userId}-connection");
            if (connection is null) return;
            lock (result) // Ensure thread safety
            {
                result.Add(connection);
            }
        });
        await Task.WhenAll(tasks);
        return result;
    }

    public async Task<string> GetConnectionUser(string connection) => await _redisCaching.GetAsync<string>($"connection-{connection}");

    // public string GetByConnection(string connection) => _distributedCache.GetString($"user-{userId}-connection");

    // public void SetConnection(string connection) => _distributedCache.SetString($"user-{UserId}-connection", connection);

    public async Task SetUserConnection(string userId, string connection) => await _redisCaching.SetAsync($"user-{userId}-connection", connection);
    public async Task SetUserConnection(string connection) => await _redisCaching.SetAsync($"user-{UserId}-connection", connection);

    public async Task SetConnectionUser(string userId, string connection) => await _redisCaching.SetAsync($"connection-{connection}", userId);

    public async Task RemoveConnection(string userId, string connection)
    {
        await _redisCaching.DeleteAsync($"user-{userId}-connection");
        await _redisCaching.DeleteAsync($"connection-{connection}");
    }

    public async Task<Contact> GetInfo() => await _redisCaching.GetAsync<Contact>($"user-{UserId}-info") ?? default!;

    public async Task<Contact> GetInfo(string userId) => await _redisCaching.GetAsync<Contact>($"user-{userId}-info") ?? default!;

    public async Task<List<Contact>> GetInfo(string[] userIds)
    {
        var result = new List<Contact>();
        // Query info cache
        var tasks = userIds.Select(async userId =>
        {
            var userInfo = await _redisCaching.GetAsync<Contact>($"user-{userId}-info");
            if (userInfo is null) return;
            lock (result) // Ensure thread safety
            {
                result.Add(userInfo);
            }
        });
        await Task.WhenAll(tasks);
        return result;
    }

    public async Task SyncUserInfo(List<GetListFriendItem> friends)
    {
        // Query info cache
        var tasks = friends.Select(async friend =>
        {
            var userInfo = await _redisCaching.GetAsync<Contact>($"user-{friend.Contact.Id}-info");
            friend.Contact.IsOnline = userInfo is not null;
        });
        await Task.WhenAll(tasks);
    }

    public void SetInfo(Contact info) => _ = _redisCaching.SetAsync($"user-{info.Id}-info", info);

    public void RemoveAll()
    {
        _ = _redisCaching.DeleteAsync($"user-{UserId}-token");
        _ = _redisCaching.DeleteAsync($"user-{UserId}-info");
        var connection = GetUserConnection(UserId);
        _ = _redisCaching.DeleteAsync($"connection-{connection}");
        _ = _redisCaching.DeleteAsync($"user-{UserId}-connection");
    }
}