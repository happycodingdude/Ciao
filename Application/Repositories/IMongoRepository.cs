namespace Application.Repositories;

/// <summary>
/// Replace: for update entire document
/// Update: Update by fields
/// </summary>
public interface IMongoRepository<T> : IInitDatabase where T : MongoBaseModel
{
    Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter);
    // IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetItemAsync(FilterDefinition<T> filter);
    void Add(T entity);
    void Replace(FilterDefinition<T> filter, T entity);
    void Update(FilterDefinition<T> filter, UpdateDefinition<T> update);
    void Update(FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter);
    void DeleteOne(FilterDefinition<T> filter);
    // Task TrackChangeAsync(Func<ChangeStreamDocument<T>, Task> action);
}