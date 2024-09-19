namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    internal protected IMongoCollection<T> _collection;
    MongoDbContext _context;
    IUnitOfWork _uow;

    public MongoBaseRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        var dbName = httpContextAccessor.HttpContext?.Items["UserId"]?.ToString();
        if (dbName is not null)
            UseDatabase(dbName, typeof(T).Name);
        // UseDatabase(typeof(T).Name, collection);
    }

    #region Init Database
    public void UseDatabase(string collection)
    {
        Console.WriteLine($"collection => {collection}");
        _collection = _context.Client.GetDatabase(typeof(T).Name).GetCollection<T>(collection);
    }

    public void UseDatabase(string dbName, string collection)
    {
        Console.WriteLine($"dbName => {dbName} and collection => {collection}");
        _collection = _context.Client.GetDatabase(dbName).GetCollection<T>(collection);
    }

    public void UseUOW(IUnitOfWork uow) => _uow = uow;

    public void UserWarehouseDB() => UseDatabase(AppConstants.WarehouseDB, typeof(T).Name);
    #endregion

    #region CRUD
    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await _collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await _collection.Find(filter).SingleOrDefaultAsync();

    public void Add(T entity) => _uow.AddOperation(() => _collection.InsertOneAsync(entity));

    public void Update(FilterDefinition<T> filter, UpdateDefinition<T> update)
    {
        update = update.Set(q => q.UpdatedTime, DateTime.Now);
        _uow.AddOperation(() => _collection.UpdateManyAsync(filter, update));
    }

    public void DeleteOne(FilterDefinition<T> filter) => _uow.AddOperation(() => _collection.DeleteOneAsync(filter));
    #endregion
}