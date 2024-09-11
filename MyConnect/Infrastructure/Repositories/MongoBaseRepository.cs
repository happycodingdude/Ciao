namespace Infrastructure.Repositories;

public class MongoBaseRepository<T> : IMongoRepository<T> where T : MongoBaseModel
{
    IMongoCollection<T> collection;
    MongoDbContext context;
    IUnitOfWork uow;

    public MongoBaseRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
    {
        Console.WriteLine($"MongoBaseRepository calling with type => {typeof(T).Name}");
        this.context = context;
        this.uow = uow;
        var dbName = httpContextAccessor.HttpContext.Session.GetString("UserId");
        UseDatabase(dbName);
    }

    public void UseDatabase(string dbName)
    {
        Console.WriteLine($"UseDatabase => {dbName}");
        collection = context.Client.GetDatabase(dbName).GetCollection<T>(typeof(T).Name);
    }

    public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter) => await collection.Find(filter).ToListAsync();

    public async Task<T> GetItemAsync(FilterDefinition<T> filter) => await collection.Find(filter).SingleAsync();

    public void Add(T entity) => uow.AddOperation(() => collection.InsertOneAsync(entity));

    // public void UpdateOne(FilterDefinition<T> filter, T entity)
    // {
    //     // entity.BeforeUpdate();
    //     uow.AddOperation(() => collection.ReplaceOneAsync(filter, entity));
    // }

    public void Update(FilterDefinition<T> filter, UpdateDefinition<T> update) => uow.AddOperation(() => collection.UpdateManyAsync(filter, update));

    public void DeleteOne(FilterDefinition<T> filter) => uow.AddOperation(() => collection.DeleteOneAsync(filter));

}