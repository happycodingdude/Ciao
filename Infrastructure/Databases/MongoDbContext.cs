namespace Infrastructure.Databases;

public class MongoDbContext(IOptions<MongoConfiguration> configuration)
{
    MongoClient client = new MongoClient(configuration.Value.ConnectionString);
    public MongoClient Client
    {
        get
        {
            return client;
        }
    }
}