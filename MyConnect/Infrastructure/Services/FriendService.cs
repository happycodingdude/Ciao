namespace Infrastructure.Services;

public class FriendService : BaseService<Friend, FriendDto>, IFriendService
{
    public FriendService(IFriendRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}