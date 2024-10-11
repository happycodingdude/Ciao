namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    internal protected IMongoCollection<T> _collection;
    MongoDbContext _context;
    IUnitOfWork _uow;

    // public MongoBaseRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    // {
    //     _context = context;
    //     var collection = httpContextAccessor.HttpContext?.Items["UserId"]?.ToString();
    //     if (collection is not null)
    //         UseDatabase(typeof(T).Name, collection);
    //     // UseDatabase(typeof(T).Name, collection);
    // }

    public MongoBaseRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _uow = uow;
        // var userId = httpContextAccessor.HttpContext.User.Claims.SingleOrDefault(q => q.Type == "UserId").Value;
        // if (userId is not null)
        // {
        //     var collection = _context.Client.GetDatabase(AppConstants.WarehouseDB).GetCollection<Contact>(nameof(Contact));
        //     var contact = collection.Find(q => q.Id == userId).SingleOrDefault();
        //     UseCollection(contact.Id);
        // }

        UseDatabase(AppConstants.WarehouseDB, typeof(T).Name);
        // UseDatabase(typeof(T).Name, collection);
    }

    #region Init Database
    // public void UseDatabase(string collection)
    // {
    //     _collection = _context.Client.GetDatabase(typeof(T).Name).GetCollection<T>(collection);
    // }

    void UseDatabase(string dbName, string collection)
    {
        Console.WriteLine($"dbName => {dbName} and collection => {collection}");
        _collection = _context.Client.GetDatabase(dbName).GetCollection<T>(collection);
    }
    // public void UseCollection(string collection)
    // {
    //     _collection = _context.Client.GetDatabase(typeof(T).Name).GetCollection<T>(collection);
    // }

    // public void UseUOW(IUnitOfWork uow) => _uow = uow;

    //internal protected void UserWarehouseDB() => UseDatabase(AppConstants.WarehouseDB, typeof(T).Name);
    #endregion

    #region CRUD
    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await _collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await _collection.Find(filter).SingleOrDefaultAsync();


    public void Add(T entity) => _uow.AddOperation(async (session) =>
    {
        await _collection.InsertOneAsync(session, entity);
        return Task.CompletedTask;
    });

    public void Replace(FilterDefinition<T> filter, T entity)
    {
        entity.UpdatedTime = DateTime.Now;
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

    public void DeleteOne(FilterDefinition<T> filter) => _uow.AddOperation((session) => _collection.DeleteOneAsync(session, filter));
    #endregion
}