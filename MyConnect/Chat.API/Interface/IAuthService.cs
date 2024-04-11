using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IAuthService : IBaseService<Contact, ContactDto>
    {
        Task SignupAsync(SignupRequest model);
        Task<LoginResponse> Login(LoginRequest model);
    }
}