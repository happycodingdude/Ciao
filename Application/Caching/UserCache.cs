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

    // public string GetToken() => _distributedCache.GetString($"user-{UserId}-token");
    public string GetToken(string userId) => _distributedCache.GetString($"user-{userId}-token");
    public void SetToken(string userId, string token) => _ = _distributedCache.SetStringAsync($"user-{userId}-token", token);

    // public string GetConnection() => _distributedCache.GetString($"user-{UserId}-connection");
    public string GetConnection(string userId) => _distributedCache.GetString($"user-{userId}-connection");
    public void SetConnection(string connection) => _distributedCache.SetString($"user-{UserId}-connection", connection);

    public Contact GetInfo() => JsonConvert.DeserializeObject<Contact>(_distributedCache.GetString($"user-{UserId}-info"));
    public void SetInfo(Contact info) => _ = _distributedCache.SetStringAsync($"user-{info.Id}-info", JsonConvert.SerializeObject(info));
    // public async Task<List<Contact>> GetListInfo(List<string> ids)
    // {
    //     var result = new List<Contact>();
    //     var tasks = ids.Select(async id =>
    //     {
    //         var key = $"user-{id}-info";
    //         var info = await _distributedCache.GetStringAsync(key);
    //         if (info != null)
    //         {
    //             lock (result) // Ensure thread safety
    //             {
    //                 result.Add(JsonConvert.DeserializeObject<Contact>(info));
    //             }
    //         }
    //     });

    //     await Task.WhenAll(tasks);
    //     return result;
    // }

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-token");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-connection");
        _ = _distributedCache.RemoveAsync($"user-{UserId}-info");
    }
}