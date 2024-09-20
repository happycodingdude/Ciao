namespace Application.Repositories;

public interface IUnitOfWork
{
    void AddOperation<TResult>(Func<Task<TResult>> operation) where TResult : class;
    Task SaveAsync();
}