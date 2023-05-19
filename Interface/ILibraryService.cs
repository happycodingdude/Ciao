using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Interface
{
    public interface ILibraryService : IRepository<Book>
    {

    }
}