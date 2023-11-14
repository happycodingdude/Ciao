using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IContactRepository : IRepository<Contact>
    {
        Task<LoginResponse> LoginAsync(LoginRequest model);
        object ValidateToken();
    }
}