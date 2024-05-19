using StackExchange.Redis;

namespace Domain.Common;

public class RedisCLient
{
    private static ConnectionMultiplexer redis;
    private static IDatabase db;

    public static IDatabase Db
    {
        get
        {
            return db;
        }
    }

    public static void Configure(IConfiguration configuration)
    {
        string environment = configuration["ASPNETCORE_ENVIRONMENT"];
        if (environment == "Development")
            redis = ConnectionMultiplexer.Connect("localhost");
        else
            redis = ConnectionMultiplexer.Connect("redis");
        db = redis.GetDatabase();
    }
}