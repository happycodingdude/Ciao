namespace Application.Repositories;

public interface IInitDatabase
{
    void UseDatabase(string dbName);
    void UseDatabase(string dbName, string collection);
    void UseUOW(IUnitOfWork uow);
}