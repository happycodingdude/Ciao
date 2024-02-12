using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IAuthService
    {
        void Signup(Contact model);
        LoginResponse Login(LoginRequest model);
        void Logout();
        Contact ValidateToken();
        void ForgotPassword(ForgotPassword model);
    }
}