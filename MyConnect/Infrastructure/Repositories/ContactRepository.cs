namespace Infrastructure.Repositories;

public class ContactRepository(AppDbContext context) : BaseRepository<Contact>(context), IContactRepository { }