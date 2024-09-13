namespace Application.Repositories;

public interface IMongoRepository<T> : IInitDatabase where T : MongoBaseModel
{
    Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter);
    // IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetItemAsync(FilterDefinition<T> filter);
    void Add(T entity);
    void Update(FilterDefinition<T> filter, UpdateDefinition<T> update);
    void DeleteOne(FilterDefinition<T> filter);
    Task TrackChangeAsync(Func<ChangeStreamDocument<T>, Task> action);
}