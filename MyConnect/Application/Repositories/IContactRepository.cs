namespace Application.Repositories;

public interface IContactRepository : IMongoRepository<Contact>
{
    Task<Contact> GetInfoAsync();
    Task<IEnumerable<ContactDto>> SearchContactsWithFriendStatus(string name);
}