namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở IRedisCaching
/// </summary>
public class Redis(IDistributedCache distributedCache, ISubscriber publisher) : IRedisCaching
{
    public async Task<T> GetAsync<T>(string key, string hashtag, CancellationToken cancellationToken)
    {
        var cachedKey = hashtag != null ? $"{{{hashtag}}}-{key}" : key;
        var cachedData = await distributedCache.GetStringAsync(cachedKey, cancellationToken);
        if (cachedData == null) return default;
        return JsonConvert.DeserializeObject<T>(cachedData);
    }

    public async Task SetAsync<T>(string key, T value, string hashtag, CancellationToken cancellationToken)
    {
        await distributedCache.SetStringAsync($"{{{hashtag}}}-{key}", JsonConvert.SerializeObject(value), cancellationToken);
    }

    public async Task RemoveKeyAsync(string key, string hashtag)
    {
        var cachedKey = hashtag != null ? $"{{{hashtag}}}-{key}" : key;
        await distributedCache.RemoveAsync(cachedKey);
    }

    public async Task PublishAsync(string channel, object value) => await publisher.PublishAsync(channel, JsonConvert.SerializeObject(value));
}