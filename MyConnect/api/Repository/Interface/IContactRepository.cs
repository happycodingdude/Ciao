using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IContactRepository : IRepository<Contact>
    {
        LoginResponse Login(LoginRequest model);
        void Logout();
        Contact ValidateToken();
    }
}