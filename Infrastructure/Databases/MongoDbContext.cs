namespace Infrastructure.Databases;

public class MongoDbContext(IConfiguration configuration)
{
    MongoClient client = new MongoClient(configuration["ConnectionStrings:mongo-db"]);
    public MongoClient Client
    {
        get
        {
            return client;
        }
    }
}