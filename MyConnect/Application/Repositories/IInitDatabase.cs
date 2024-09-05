namespace Application.Repositories;

public interface IInitDatabase
{
    void UseDatabase(string dbName);
}