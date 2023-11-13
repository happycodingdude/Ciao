using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IRepository<T> : IDisposable
    {
        Task<List<T>> GetAll(PagingParam? param = null);
        Task<T> GetById(int id, PagingParam? param = null);
        Task<T> Add(T entity);
        Task<T> Update(T entity);
        Task<bool> Delete(int id);
    }
}