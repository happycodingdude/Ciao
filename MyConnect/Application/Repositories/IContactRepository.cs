namespace Application.Repositories;

public interface IContactRepository : IMongoRepository<Contact>
{
    Task<IEnumerable<ContactDto>> SearchContactsWithFriendStatus(string name);
}