namespace Chat.API.Repository;

public class ContactRepository : BaseRepository<Contact>, IContactRepository
{
    public ContactRepository(CoreContext context) : base(context) { }
}