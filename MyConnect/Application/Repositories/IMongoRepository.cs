namespace Application.Repositories;

public interface IMongoRepository<T>
{
    // IEnumerable<T> GetAll();
    // IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetByIdAsync(Expression<Func<T, bool>> expression);
    Task AddAsync(T entity);
    // void Add(List<T> entities);
    // void Update(T entity);
    // void Update(List<T> entity);
    // void Delete(Guid id);
    // void Delete(List<T> entities);
    // DbSet<T> DbSet { get; }
}