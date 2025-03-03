namespace Application.Caching;

public class UserCache
{
    readonly IDistributedCache _distributedCache;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IMapper _mapper;

    public UserCache(IDistributedCache distributedCache, IHttpContextAccessor httpContextAccessor, IMapper mapper)
    {
        _distributedCache = distributedCache;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public string GetToken(string userId) => _distributedCache.GetString($"user-{userId}-token");

    public void SetToken(string userId, string token) => _ = _distributedCache.SetStringAsync($"user-{userId}-token", token);

    public string GetUserConnection(string userId) => _distributedCache.GetString($"user-{userId}-connection");

    public async Task<List<string>> GetUserConnection(string[] userIds)
    {
        var result = new List<string>();
        // Query info cache
        var tasks = userIds.Select(async userId =>
        {
            var connection = await _distributedCache.GetStringAsync($"user-{userId}-connection");
            if (connection is null) return;
            lock (result) // Ensure thread safety
            {
                result.Add(connection);
            }
        });
        await Task.WhenAll(tasks);
        return result;
    }

    public string GetConnectionUser(string connection) => _distributedCache.GetString($"connection-{connection}");

    // public string GetByConnection(string connection) => _distributedCache.GetString($"user-{userId}-connection");

    // public void SetConnection(string connection) => _distributedCache.SetString($"user-{UserId}-connection", connection);

    public void SetUserConnection(string userId, string connection) => _distributedCache.SetString($"user-{userId}-connection", connection);

    public void SetConnectionUser(string userId, string connection) => _distributedCache.SetString($"connection-{connection}", userId);

    public async Task RemoveConnection(string userId, string connection)
    {
        await _distributedCache.RemoveAsync($"user-{userId}-connection");
        await _distributedCache.RemoveAsync($"connection-{connection}");
    }

    public Contact GetInfo() => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{UserId}-info"));

    public Contact GetInfo(string userId) => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{userId}-info") ?? "");

    public async Task<List<Contact>> GetInfo(string[] userIds)
    {
        var result = new List<Contact>();
        // Query info cache
        var tasks = userIds.Select(async userId =>
        {
            var userInfo = await _distributedCache.GetStringAsync($"user-{userId}-info");
            if (userInfo is null) return;
            lock (result) // Ensure thread safety
            {
                result.Add(JsonConvert.DeserializeObject<Contact>(userInfo));
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
            var userInfo = await _distributedCache.GetStringAsync($"user-{friend.Contact.Id}-info");
            friend.Contact.IsOnline = userInfo is not null;
        });
        await Task.WhenAll(tasks);
    }

    public void SetInfo(Contact info) => _ = _distributedCache.SetStringAsync($"user-{info.Id}-info", JsonConvert.SerializeObject(info));

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-token");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-info");
        var connection = GetUserConnection(UserId);
        _ = _distributedCache.RemoveAsync($"connection-{connection}");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-connection");
    }
}