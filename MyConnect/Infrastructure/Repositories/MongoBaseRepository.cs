namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    IMongoCollection<T> _collection;
    MongoDbContext _context;
    IUnitOfWork _uow;

    public MongoBaseRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        // Console.WriteLine($"MongoBaseRepository calling with type => {typeof(T).Name}");
        _context = context;
        var dbName = httpContextAccessor.HttpContext.Items["UserId"]?.ToString();
        if (dbName is not null)
            UseDatabase(dbName);
    }

    public void UseDatabase(string dbName)
    {
        Console.WriteLine($"UseDatabase => {dbName}");
        _collection = _context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    }

    public void UseUOW(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await _collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await _collection.Find(filter).SingleAsync();

    public void Add(T entity) => _uow.AddOperation(() => _collection.InsertOneAsync(entity));

    // public void UpdateOne(FilterDefinition<T> filter, T entity)
    // {
    //     // entity.BeforeUpdate();
    //     uow.AddOperation(() => collection.ReplaceOneAsync(filter, entity));
    // }

    public void Update(FilterDefinition<T> filter, UpdateDefinition<T> update) => _uow.AddOperation(() => _collection.UpdateManyAsync(filter, update));

    public void DeleteOne(FilterDefinition<T> filter) => _uow.AddOperation(() => _collection.DeleteOneAsync(filter));

}