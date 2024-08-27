
namespace Infrastructure.Repositories;

public class MongoBaseRepository<T>(MongoDbContext context) : IMongoRepository<T> where T : MongoBaseModel
{
    public async Task AddAsync(T entity)
    {
        await context.Client.GetDatabase("test").GetCollection<T>("Notification").InsertOneAsync(entity);
    }

    public async Task<T> GetByIdAsync(Expression<Func<T, bool>> expression)
    {
        return await context.Client.GetDatabase("test").GetCollection<T>("Notification").Find(expression).FirstOrDefaultAsync();
    }
}