using Application.Services;

namespace Application.Caching;

public class UserCache
{
    readonly IRedisCaching _redisCaching;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IPresenceService _presenceService;

    public UserCache(IRedisCaching redisCaching, IHttpContextAccessor httpContextAccessor, IPresenceService presenceService)
    {
        _redisCaching = redisCaching;
        _httpContextAccessor = httpContextAccessor;
        _presenceService = presenceService;
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
        // IsOnline phải lấy từ presence service (Redis sorted set, heartbeat 30s/threshold 60s) —
        // đây là single source of truth, đồng nhất với GetConversations. Trước đây dùng sự tồn tại
        // của user-info cache làm proxy, nhưng cache đó chỉ bị xoá khi user signout tường minh nên
        // friend đóng tab/expire token vẫn hiển thị "online" vĩnh viễn → trạng thái sai.
        var tasks = friends.Select(async friend =>
        {
            friend.Contact.IsOnline = await IsOnlineVisibleAsync(friend.Contact.Id);
        });
        await Task.WhenAll(tasks);
    }

    // Presence ĐÃ áp privacy mask: nếu người được xem tắt ShowOnlineStatus → luôn trả offline.
    // Phải enforce ở BE (không chỉ ẩn FE) vì IsOnline lộ qua API. Settings đọc từ user-info cache
    // (đã populate khi user online qua CacheConsumer). Cache miss → fail-open (mặc định bật) —
    // chỉ xảy ra với user vốn đã online mà cache evicted, hiếm và mặc định ShowOnlineStatus=true.
    public async Task<bool> IsOnlineVisibleAsync(string userId)
    {
        if (!await _presenceService.IsOnlineAsync(userId)) return false;
        var info = await GetInfo(userId);
        return info?.Settings?.ShowOnlineStatus ?? true;
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
