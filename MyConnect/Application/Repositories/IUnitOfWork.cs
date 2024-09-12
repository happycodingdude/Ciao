namespace Application.Repositories;

public interface IUnitOfWork
{
    T GetService<T>() where T : IInitDatabase;
    void AddOperation(Action operation);
    Task SaveAsync();
}