using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IContactRepository : IRepository<Contact>
    {
        void Signup(Contact model);
        LoginResponse Login(LoginRequest model);
        void Logout();
        Contact ValidateToken();
    }
}