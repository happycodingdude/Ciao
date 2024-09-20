namespace Application.Repositories;

public interface IService
{
    T Get<T>() where T : IInitDatabase;
    T Get<T>(IUnitOfWork uow) where T : IInitDatabase;
}