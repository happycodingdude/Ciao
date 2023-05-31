using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Interface
{
    public interface IUserService : IRepository<User>
    {
        Task<LoginResponse> Login(LoginRequest model);
        bool CheckToken();
    }
}