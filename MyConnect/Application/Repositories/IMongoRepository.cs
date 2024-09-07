namespace Application.Repositories;

public interface IMongoRepository<T> : IInitDatabase where T : MongoBaseModel
{
    //void InitCollection(string dbName);
    Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter);
    // IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetItemAsync(FilterDefinition<T> filter);
    void AddAsync(T entity);
    // void Add(List<T> entities);
    Task UpdateOneAsync(FilterDefinition<T> filter, T entity);
    Task UpdateManyAsync(FilterDefinition<T> filter, UpdateDefinition<T> update);
    // void Update(List<T> entity);
    Task DeleteOneAsync(FilterDefinition<T> filter);
    // void Delete(List<T> entities);
    // DbSet<T> DbSet { get; }
}