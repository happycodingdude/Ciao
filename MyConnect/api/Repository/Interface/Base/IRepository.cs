namespace MyConnect.Repository
{
    public interface IRepository<T> : IDisposable
    {
        IEnumerable<T> GetAll();
        T GetById(Guid id);
        void Add(T entity);
        void AddRange(List<T> entities);
        void Update(T entity);
        void Delete(Guid id);
    }
}