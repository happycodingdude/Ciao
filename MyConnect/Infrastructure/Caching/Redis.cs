namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở IRedisCaching
/// </summary>
public class Redis : IRedisCaching
{
    readonly IDistributedCache _distributedCache;

    public Redis(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<T> GetAsync<T>(string key, string hashtag, CancellationToken cancellationToken)
    {
        try
        {
            var cachedKey = hashtag != null ? $"{{{hashtag}}}-{key}" : key;
            var cachedData = await _distributedCache.GetStringAsync(cachedKey, cancellationToken);
            if (cachedData == null) return default;
            return JsonConvert.DeserializeObject<T>(cachedData);
        }
        catch (Exception)
        {
            return default;
        }

    }

    public async Task<bool> SetAsync<T>(string key, T value, string hashtag, CancellationToken cancellationToken)
    {
        try
        {
            await _distributedCache.SetStringAsync($"{{{hashtag}}}-{key}", JsonConvert.SerializeObject(value), cancellationToken);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> RemoveKeyAsync(string key, string hashtag)
    {
        try
        {
            var cachedKey = hashtag != null ? $"{{{hashtag}}}-{key}" : key;
            await _distributedCache.RemoveAsync(cachedKey);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
}