namespace Application.Repositories;

public interface IMongoRepository<T> where T : MongoBaseModel
{
    //void InitCollection(string dbName);
    Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>> expression);
    // IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetItemAsync(Expression<Func<T, bool>> expression);
    Task AddAsync(T entity);
    // void Add(List<T> entities);
    Task UpdateAsync(Expression<Func<T, bool>> expression, T entity);
    // void Update(List<T> entity);
    Task DeleteAsync(Expression<Func<T, bool>> expression);
    // void Delete(List<T> entities);
    // DbSet<T> DbSet { get; }
}