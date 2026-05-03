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

    private string UserId => _httpContextAccessor.HttpContext!.Items["UserId"]!.ToString()!;

    public async Task<string> GetToken(string userId) =>
        await _redisCaching.GetAsync<string>(AppConstants.RedisKey_UserToken.Replace("{userId}", userId)) ?? string.Empty;

    public async Task SetTokenAsync(string userId, string token) =>
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserToken.Replace("{userId}", userId), token);

    public async Task<string> GetUserConnection(string userId) =>
        await _redisCaching.GetAsync<string>(AppConstants.RedisKey_UserConnection.Replace("{userId}", userId)) ?? string.Empty;

    public async Task<List<string>> GetUserConnection(string[] userIds)
    {
        var result = new List<string>();
        var tasks = userIds.Select(async userId =>
        {
            var connection = await _redisCaching.GetAsync<string>(AppConstants.RedisKey_UserConnection.Replace("{userId}", userId));
            if (connection is null) return;
            lock (result)
                result.Add(connection);
        });
        await Task.WhenAll(tasks);
        return result;
    }

    public async Task<string> GetConnectionUser(string connection) =>
        await _redisCaching.GetAsync<string>($"connection-{connection}") ?? string.Empty;

    public async Task SetUserConnection(string userId, string connection) =>
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConnection.Replace("{userId}", userId), connection);

    public async Task SetUserConnection(string connection) =>
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserConnection.Replace("{userId}", UserId), connection);

    public async Task SetConnectionUser(string userId, string connection) =>
        await _redisCaching.SetAsync($"connection-{connection}", userId);

    public async Task RemoveConnection(string userId, string connection)
    {
        await Task.WhenAll(
            _redisCaching.DeleteAsync($"user-{userId}-connection"),
            _redisCaching.DeleteAsync($"connection-{connection}"));
    }

    public async Task<Contact> GetInfo() =>
        await _redisCaching.GetAsync<Contact>(AppConstants.RedisKey_UserInfo.Replace("{userId}", UserId)) ?? default!;

    public async Task<Contact> GetInfo(string userId) =>
        await _redisCaching.GetAsync<Contact>(AppConstants.RedisKey_UserInfo.Replace("{userId}", userId)) ?? default!;

    public async Task<List<Contact>> GetInfo(string[] userIds)
    {
        var result = new List<Contact>();
        var tasks = userIds.Select(async userId =>
        {
            var userInfo = await _redisCaching.GetAsync<Contact>(AppConstants.RedisKey_UserInfo.Replace("{userId}", userId));
            if (userInfo is null) return;
            lock (result)
                result.Add(userInfo);
        });
        await Task.WhenAll(tasks);
        return result;
    }

    public async Task SyncUserInfo(List<GetListFriendItem> friends)
    {
        var tasks = friends.Select(async friend =>
        {
            var userInfo = await _redisCaching.GetAsync<Contact>(AppConstants.RedisKey_UserInfo.Replace("{userId}", friend.Contact.Id));
            friend.Contact.IsOnline = userInfo is not null;
        });
        await Task.WhenAll(tasks);
    }

    public async Task SetInfoAsync(Contact info) =>
        await _redisCaching.SetAsync(AppConstants.RedisKey_UserInfo.Replace("{userId}", info.Id), info);

    public async Task RemoveAllAsync()
    {
        var connection = await GetUserConnection(UserId);

        var tasks = new List<Task>
        {
            _redisCaching.DeleteAsync(AppConstants.RedisKey_UserToken.Replace("{userId}", UserId)),
            _redisCaching.DeleteAsync(AppConstants.RedisKey_UserInfo.Replace("{userId}", UserId)),
            _redisCaching.DeleteAsync(AppConstants.RedisKey_UserConnection.Replace("{userId}", UserId)),
        };

        if (!string.IsNullOrEmpty(connection))
            tasks.Add(_redisCaching.DeleteAsync($"connection-{connection}"));

        await Task.WhenAll(tasks);
    }
}
