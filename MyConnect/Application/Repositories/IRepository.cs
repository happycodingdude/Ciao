namespace Application.Repositories;

public interface IRepository<T> : IDisposable where T : class
{
    IEnumerable<T> GetAll();
    IEnumerable<T> GetAll(int page, int limit);
    Task<T> GetByIdAsync(Guid id);
    void Add(T entity);
    void Add(List<T> entities);
    void Update(T entity);
    void Update(List<T> entity);
    void Delete(Guid id);
    void Delete(List<T> entities);
    DbSet<T> DbSet { get; }
}