namespace Application.Caching;

/// <summary>
/// Description: Interface này khai báo các hàm tương tác với Redis
/// </summary>
public interface IRedisCaching
{
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task<T?> GetAsync<T>(string key);
    Task<RedisValue[]> GetAsync(RedisKey[] key);
    Task DeleteAsync(string key);
    Task<bool> ExistsAsync(string key);
    Task PublishAsync(string channel, object value);
}