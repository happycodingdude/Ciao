namespace Application.Repositories;

public interface IContactRepository : IMongoRepository<Contact>
{
    Task<IEnumerable<Contact>> SearchContactsWithFriendStatus(string name);
}