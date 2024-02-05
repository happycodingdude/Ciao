using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IUserService
    {
        void Signup(Contact model);
        LoginResponse Login(LoginRequest model);
        void Logout();
        Contact ValidateToken();
    }
}