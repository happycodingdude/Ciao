namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    internal protected IMongoCollection<T> _collection;
    IUnitOfWork _uow;

    public MongoBaseRepository(MongoDbContext context, IUnitOfWork uow)
    {
        _uow = uow;
        _collection = context.Client.GetDatabase(AppConstants.WarehouseDB).GetCollection<T>(typeof(T).Name);
    }

    #region CRUD
    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await _collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await _collection.Find(filter).SingleOrDefaultAsync();


    public void Add(T entity) => _uow.AddOperation(async (session) =>
    {
        entity.UpdatedTime = DateTime.Now;
        await _collection.InsertOneAsync(session, entity);
        return Task.CompletedTask;
    });

    public void Replace(FilterDefinition<T> filter, T entity)
    {
        entity.UpdatedTime = DateTime.Now;
        _uow.AddOperation((session) => _collection.ReplaceOneAsync(session, filter, entity));
    }

    public void ReplaceNoTrackingTime(FilterDefinition<T> filter, T entity)
    {
        _uow.AddOperation((session) => _collection.ReplaceOneAsync(session, filter, entity));
    }

    public void Update(FilterDefinition<T> filter, UpdateDefinition<T> update)
    {
        update = update.Set(q => q.UpdatedTime, DateTime.Now);
        _uow.AddOperation((session) => _collection.UpdateManyAsync(session, filter, update));
    }

    public void Update(FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter)
    {
        update = update.Set(q => q.UpdatedTime, DateTime.Now);
        _uow.AddOperation((session) => _collection.UpdateManyAsync(session, filter, update, new UpdateOptions { ArrayFilters = new[] { arrayFilter } }));
    }

    public void UpdateNoTrackingTime(FilterDefinition<T> filter, UpdateDefinition<T> update)
    {
        _uow.AddOperation((session) => _collection.UpdateManyAsync(session, filter, update));
    }

    public void UpdateNoTrackingTime(FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter)
    {
        _uow.AddOperation((session) => _collection.UpdateManyAsync(session, filter, update, new UpdateOptions { ArrayFilters = new[] { arrayFilter } }));
    }

    public void Update(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> update)
    {
        _uow.AddOperation(key, (session) => _collection.UpdateManyAsync(session, filter, update));
    }

    public void Update(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> update, ArrayFilterDefinition<T> arrayFilter)
    {
        _uow.AddOperation(key, (session) => _collection.UpdateManyAsync(session, filter, update, new UpdateOptions { ArrayFilters = new[] { arrayFilter } }));
    }

    public void AddFallback(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> fallback)
    {
        _uow.AddFallback(key, (session) => _collection.UpdateManyAsync(session, filter, fallback));
    }

    public void AddFallback(Guid key, FilterDefinition<T> filter, UpdateDefinition<T> fallback, ArrayFilterDefinition<T> arrayFilter)
    {
        _uow.AddFallback(key, (session) => _collection.UpdateManyAsync(session, filter, fallback, new UpdateOptions { ArrayFilters = new[] { arrayFilter } }));
    }

    public void DeleteOne(FilterDefinition<T> filter) => _uow.AddOperation((session) => _collection.DeleteOneAsync(session, filter));
    #endregion
}