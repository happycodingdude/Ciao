namespace Chat.API.Features;

public class ContactService : BaseService<Contact, ContactDto>, IContactService
{
    public ContactService(IContactRepository repo,
    IUnitOfWork unitOfWork,
    IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}