namespace Application.Caching;

public class FriendCache
{
    readonly IRedisCaching _redisCaching;
    readonly IHttpContextAccessor _httpContextAccessor;

    public FriendCache(IRedisCaching redisCaching, IHttpContextAccessor httpContextAccessor)
    {
        _redisCaching = redisCaching;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    public async Task<List<FriendCacheModel>> GetFriends()
    {
        var friendCacheData = await _redisCaching.GetAsync<List<FriendCacheModel>>(AppConstants.RedisKey_UserFriends.Replace("{userId}", UserId)) ?? default;
        return friendCacheData;
    }

    public async Task<List<FriendCacheModel>> GetFriends(string userId)
    {
        var friendCacheData = await _redisCaching.GetAsync<List<FriendCacheModel>>(AppConstants.RedisKey_UserFriends.Replace("{userId}", userId)) ?? default;
        return friendCacheData;
    }

    public async Task SetFriends(List<FriendCacheModel> fiends)
    {
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserFriends.Replace("{userId}", UserId), fiends);
    }

    public async Task SetFriends(string userId, List<FriendCacheModel> fiends)
    {
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserFriends.Replace("{userId}", userId), fiends);
    }

    public void RemoveAll()
    {
        _ = _redisCaching.DeleteAsync(AppConstants.RedisKey_UserFriends.Replace("{userId}", UserId));
    }
}