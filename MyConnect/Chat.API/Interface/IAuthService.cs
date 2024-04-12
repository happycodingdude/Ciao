using Chat.API.Model;
using Chat.API.Repository;

namespace Chat.API.Interface
{
    public interface IAuthService : IBaseService<Contact, ContactDto>
    {
        Task SignupAsync(SignupRequest model);
    }
}