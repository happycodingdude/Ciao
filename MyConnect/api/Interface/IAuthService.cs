using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IAuthService : IBaseService<Contact, ContactDto>
    {
        void Signup(ContactDto model);
        LoginResponse Login(LoginRequest model);
        bool Logout();
        ContactDto Validate();
        void ForgotPassword(ForgotPassword model);
    }
}