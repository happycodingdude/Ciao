namespace Application.Caching;

public class UserCache
{
    readonly IDistributedCache _distributedCache;
    readonly IHttpContextAccessor _httpContextAccessor;

    public UserCache(IDistributedCache distributedCache, IHttpContextAccessor httpContextAccessor)
    {
        _distributedCache = distributedCache;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public string GetToken() => _distributedCache.GetString($"user-{UserId}-token");
    public string GetToken(string userId) => _distributedCache.GetString($"user-{userId}-token");
    public void SetToken(string userId, string token) => _distributedCache.SetString($"user-{userId}-token", token);

    public string GetConnection() => _distributedCache.GetString($"user-{UserId}-connection");
    public string GetConnection(string userId) => _distributedCache.GetString($"user-{userId}-connection");
    public void SetConnection(string connection) => _distributedCache.SetString($"user-{UserId}-connection", connection);

    public Contact GetInfo() => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{UserId}-info"));
    public void SetInfo(Contact info) => _distributedCache.SetString($"user-{info.Id}-info", JsonConvert.SerializeObject(info));

    public void RemoveAll()
    {
        _distributedCache.Remove($"user-{UserId}-token");
        _distributedCache.Remove($"user-{UserId}-connection");
        _distributedCache.Remove($"user-{UserId}-info");
    }
}