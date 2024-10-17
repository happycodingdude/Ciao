namespace Application.Repositories;

public interface IContactRepository : IMongoRepository<Contact>
{
    Task<Contact> GetByUsername(string username);
    string GetUserId();
    Task<Contact> GetInfoAsync();
    Task<IEnumerable<ContactDto>> SearchContactsWithFriendStatus(string name);
}