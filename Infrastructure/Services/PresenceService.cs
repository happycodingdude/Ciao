namespace Infrastructure.Services;

public class RedisPresenceService : IPresenceService
{
    const string PresenceKey = "online_users";
    // Last Seen: hash userId → unix seconds của lần hoạt động cuối. Không TTL —
    // presence set bị cleanup định kỳ nên cần chỗ lưu bền cho "hoạt động lần cuối".
    const string LastActiveKey = "last_active_users";
    const int OnlineThresholdSeconds = 60;

    readonly IDatabase _db;

    public RedisPresenceService(IConnectionMultiplexer redis)
    {
        _db = redis.GetDatabase();
    }

    public async Task UpdateActivityAsync(string userId)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SortedSetAddAsync(
            PresenceKey,
            userId,
            now
        );
        await _db.HashSetAsync(LastActiveKey, userId, now);
    }

    public async Task SetOfflineAsync(string userId)
    {
        // Xóa user khỏi presence set ngay khi logout để friend thấy offline tức thì,
        // không phải chờ score quá threshold (PresenceCleanup chỉ chạy định kỳ).
        await _db.SortedSetRemoveAsync(PresenceKey, userId);
        // Logout = mốc hoạt động cuối.
        await _db.HashSetAsync(LastActiveKey, userId, DateTimeOffset.UtcNow.ToUnixTimeSeconds());
    }

    public async Task<DateTime?> GetLastActiveAsync(string userId)
    {
        var value = await _db.HashGetAsync(LastActiveKey, userId);
        if (value.IsNullOrEmpty) return null;
        return DateTimeOffset.FromUnixTimeSeconds((long)value).UtcDateTime;
    }

    public async Task<bool> IsOnlineAsync(string userId)
    {
        var score = await _db.SortedSetScoreAsync(
            PresenceKey,
            userId
        );

        if (score is null)
            return false;

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // Console.WriteLine($"User {userId} now: {now}, last activity: {score}");
        // Console.WriteLine($"User {userId} last activity: {now - score} seconds ago");

        return now - score < OnlineThresholdSeconds;
    }

    public async Task CleanupAsync()
    {
        var cutoff =
            DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            - OnlineThresholdSeconds;

        await _db.SortedSetRemoveRangeByScoreAsync(
            PresenceKey,
            double.NegativeInfinity,
            cutoff
        );
    }
}
