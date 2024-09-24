namespace Application.Repositories;

public interface IInitDatabase
{
    // void UseDatabase(string collection);
    void UseDatabase(string dbName, string collection);
    void UseCollection(string collection);
    void UseUOW(IUnitOfWork uow);
    // void UserWarehouseDB();
}