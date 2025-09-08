namespace Infrastructure.Caching;

/// <summary>
/// Description: Lớp này triển khai các hàm đã khai báo ở IRedisCaching
/// </summary>
public class RedisCaching : IRedisCaching
{
    readonly IDatabase _db;
    readonly ISubscriber _publisher;

    public RedisCaching(IConnectionMultiplexer connectionMultiplexer, ISubscriber publisher)
    {
        _db = connectionMultiplexer.GetDatabase();
        _publisher = publisher;
    }

    // #SetString: Lưu object thành JSON string
    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonConvert.SerializeObject(value);
        await _db.StringSetAsync(key, json, expiry);
    }

    // #GetString: Lấy object từ JSON string
    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _db.StringGetAsync(key);
        return value.HasValue ? JsonConvert.DeserializeObject<T>(value!) : default;
    }

    // #GetString: Lấy danh sách object từ JSON string
    public async Task<RedisValue[]> GetAsync(RedisKey[] key) => await _db.StringGetAsync(key);

    // #Delete: Xoá key khỏi Redis
    public async Task DeleteAsync(string key) => await _db.KeyDeleteAsync(key);

    // #KeyExists: Kiểm tra key có tồn tại hay không
    public async Task<bool> ExistsAsync(string key) => await _db.KeyExistsAsync(key);

    public async Task PublishAsync(string channel, object value) => await _publisher.PublishAsync(channel, JsonConvert.SerializeObject(value));
}