namespace Chat.API.Implement;

public class AuthService : BaseService<Contact, ContactDto>, IAuthService
{
    public AuthService(IContactRepository repo,
    IUnitOfWork unitOfWork,
    IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}