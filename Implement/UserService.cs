using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class UserService : BaseRepository<User>, IUserService
    {
        public UserService(LibraryContext context) : base(context)
        {

        }

        public Task<LoginResponse> Login(LoginRequest model)
        {
            throw new NotImplementedException();
        }
    }
}