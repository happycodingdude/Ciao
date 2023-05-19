using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class LibraryService : BaseRepository<Book>, ILibraryService
    {
        public LibraryService(LibraryContext context) : base(context)
        {

        }
    }
}