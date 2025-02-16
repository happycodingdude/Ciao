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

    public string GetConnection(string userId) => _distributedCache.GetString($"user-{userId}-connection");

    public void SetConnection(string connection) => _distributedCache.SetString($"user-{UserId}-connection", connection);

    public Contact GetInfo() => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{UserId}-info"));

    public Contact GetInfo(string userId) => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{userId}-info") ?? "");

    public void SetInfo(Contact info) => _ = _distributedCache.SetStringAsync($"user-{info.Id}-info", JsonConvert.SerializeObject(info));

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-token");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-connection");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-info");
    }
}