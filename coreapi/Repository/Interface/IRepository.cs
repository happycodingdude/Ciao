using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public interface IRepository<T> : IDisposable
    {
        Task<List<T>> GetAll(string[]? includes = null, List<PagingParam>? conditions = null);
        Task<T> GetById(int id, string[]? includes = null, bool isCollection = false);
        Task<T> Add(T entity);
        Task<T> Update(T entity);
        Task<bool> Delete(int id);
    }
}