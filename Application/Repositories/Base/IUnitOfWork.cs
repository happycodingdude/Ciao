namespace Application.Repositories;

public interface IUnitOfWork
{
    void AddOperation<TResult>(Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class;
    void AddOperation<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class;
    void AddFallback<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> fallback) where TResult : class;
    Task SaveAsync();
}