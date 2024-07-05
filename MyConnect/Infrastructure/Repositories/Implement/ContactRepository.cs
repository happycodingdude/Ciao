namespace Infrastructure.Repositories;

public class ContactRepository : BaseRepository<Contact>, IContactRepository
{
    public ContactRepository(AppDbContext context) : base(context) { }
}