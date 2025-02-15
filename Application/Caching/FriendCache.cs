namespace Application.Caching;

public class FriendCache
{
    readonly IDistributedCache _distributedCache;
    readonly IHttpContextAccessor _httpContextAccessor;

    public FriendCache(IDistributedCache distributedCache, IHttpContextAccessor httpContextAccessor)
    {
        _distributedCache = distributedCache;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public async Task<List<FriendCacheModel>> GetFriends()
    {
        var friendCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-friends") ?? "";
        return JsonConvert.DeserializeObject<List<FriendCacheModel>>(friendCacheData);
    }

    public async Task SetFriends(string userId, List<FriendCacheModel> fiends)
    {
        await _distributedCache.SetStringAsync($"user-{userId}-friends", JsonConvert.SerializeObject(fiends));
    }

    public void RemoveAll()
    {
        _ = _distributedCache.RemoveAsync($"user-{UserId}-friends");
    }
}