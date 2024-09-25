namespace Infrastructure.Repositories;

// public class FriendRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Friend>(context, uow, httpContextAccessor), IFriendRepository
// { }
public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    readonly IContactRepository _contactRepository;

    public FriendRepository(MongoDbContext context,
        IUnitOfWork uow,
        IHttpContextAccessor httpContextAccessor,
        IService<IContactRepository> contactService)
        : base(context, uow, httpContextAccessor)
    {
        _contactRepository = contactService.Get();
        UserWarehouseDB();
    }

    public async Task<string> GetFriendStatusAsync(Friend friend)
    {
        if (friend.AcceptTime.HasValue) return "friend";
        var user = await _contactRepository.GetInfoAsync();
        if (friend.FromContact.ContactId == user.Id) return "request_sent";
        else return "request_received";
    }
}