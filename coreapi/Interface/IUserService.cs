using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Interface
{
    public interface IUserService : IRepository<User>
    {
        Task<LoginResponse> LoginAsync(LoginRequest model);
        bool CheckToken();
    }
}