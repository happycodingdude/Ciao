using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ContactRepository : BaseRepository<Contact>
    {
        public ContactRepository(CoreContext context) : base(context) { }
    }
}