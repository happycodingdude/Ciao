namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    private IMongoCollection<T> collection;

    public MongoBaseRepository(MongoDbContext context, string dbName)
    {
        collection = context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    }

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>> expression) => await collection.Find(expression).ToListAsync();

    public async Task<T> GetItemAsync(Expression<Func<T, bool>> expression) => await collection.Find(expression).SingleAsync();

    public async Task AddAsync(T entity) => await collection.InsertOneAsync(entity);

    public async Task UpdateAsync(Expression<Func<T, bool>> expression, T entity) => await collection.ReplaceOneAsync(expression, entity);

    public async Task DeleteAsync(Expression<Func<T, bool>> expression) => await collection.DeleteOneAsync(expression);

}