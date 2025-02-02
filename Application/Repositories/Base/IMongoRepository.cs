namespace Application.Repositories;

public interface IMongoRepository<T> where T : MongoBaseModel
{
    Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter);
    Task<T> GetItemAsync(FilterDefinition<T> filter);
    void Add(T entity);
    void Replace(FilterDefinition<T> filter, T entity);
    void ReplaceNoTrackingTime(FilterDefinition<T> filter, T entity);
    void Update(FilterDefinition<T> filter, UpdateDefinition<T> update);
    void Update(FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter);
    void UpdateNoTrackingTime(FilterDefinition<T> filter, UpdateDefinition<T> update);
    void UpdateNoTrackingTime(FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter);
    void Update(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> update);
    void Update(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter);
    void AddFallback(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> fallback);
    void AddFallback(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> fallback, ArrayFilterDefinition<T> arrayFilter);
    void DeleteOne(FilterDefinition<T> filter);
}