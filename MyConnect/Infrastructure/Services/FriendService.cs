namespace Infrastructure.Services;

public class FriendService(IFriendRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
    : BaseService<Friend, FriendDto>(repo, unitOfWork, mapper), IFriendService
{ }