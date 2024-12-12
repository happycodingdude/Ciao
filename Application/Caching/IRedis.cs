namespace Application.Caching;

/// <summary>
/// Description: Interface này khai báo các hàm tương tác với Redis
/// </summary>
public interface IRedisCaching
{
    Task<T> GetAsync<T>(string key, string hashtag, CancellationToken cancellationToken);
    Task SetAsync<T>(string key, T value, string hashtag, CancellationToken cancellationToken);
    Task RemoveKeyAsync(string key, string hashtag);
    Task PublishAsync(string channel, object value);
}