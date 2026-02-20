namespace Infrastructure.Services;

public class RedisPresenceService : IPresenceService
{
    const string PresenceKey = "online_users";
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
