namespace Infrastructure.Repositories;

public class MongoBaseRepository<T>(MongoDbContext context, IUnitOfWork uow) : IMongoRepository<T> where T : MongoBaseModel
{
    private IMongoCollection<T> collection;

    public void UseDatabase(string dbName)
    {
        Console.WriteLine($"UseDatabase => {dbName}");
        collection = context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    }

    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await collection.Find(filter).SingleAsync();

    public void AddAsync(T entity) => uow.AddOperation(() => collection.InsertOneAsync(entity));

    public async Task UpdateOneAsync(FilterDefinition<T> filter, T entity)
    {
        entity.BeforeUpdate();
        await collection.ReplaceOneAsync(filter, entity);
    }

    public async Task UpdateManyAsync(FilterDefinition<T> filter, UpdateDefinition<T> update) => await collection.UpdateManyAsync(filter, update);

    public async Task DeleteOneAsync(FilterDefinition<T> filter) => await collection.DeleteOneAsync(filter);

}