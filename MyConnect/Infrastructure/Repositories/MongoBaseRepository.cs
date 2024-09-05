namespace Infrastructure.Repositories;

public class MongoBaseRepository<T>(MongoDbContext context) : IMongoRepository<T>, IInitDatabase where T : MongoBaseModel
{
    private IMongoCollection<T> collection;
    // private MongoClient _client;

    // public MongoBaseRepository(MongoDbContext context, string dbName)
    // {
    //     collection = context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    // }

    // public MongoBaseRepository(MongoDbContext context)
    // {
    //     _client = context.Client;
    // }

    public void UseDatabase(string dbName)
    {
        collection = context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    }

    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await collection.Find(filter).SingleAsync();

    public async Task AddAsync(T entity) => await collection.InsertOneAsync(entity);

    public async Task UpdateOneAsync(FilterDefinition<T> filter, T entity)
    {
        entity.BeforeUpdate();
        await collection.ReplaceOneAsync(filter, entity);
    }

    public async Task UpdateManyAsync(FilterDefinition<T> filter, UpdateDefinition<T> update) => await collection.UpdateManyAsync(filter, update);

    public async Task DeleteOneAsync(FilterDefinition<T> filter) => await collection.DeleteOneAsync(filter);

}