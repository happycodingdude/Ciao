namespace Presentation.Friends;

public static class GetListFriend
{
    public record Request() : IRequest<IEnumerable<GetListFriendItem>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<GetListFriendItem>>
    {
        readonly FriendCache _friendCache;
        readonly UserCache _userCache;
        readonly IMapper _mapper;

        public Handler(FriendCache friendCache, UserCache userCache, IMapper mapper)
        {
            _friendCache = friendCache;
            _userCache = userCache;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GetListFriendItem>> Handle(Request request, CancellationToken cancellationToken)
        {
            // return await _friendRepository.GetListFriend();
            var friends = await _friendCache.GetFriends();
            // var onlyGetFriendItem = friends.Where(q => q.FriendStatus == AppConstants.FriendStatus_Friend);
            var result = _mapper.Map<List<GetListFriendItem>>(friends);
            await _userCache.SyncUserInfo(result);
            return result;
        }
    }
}

public class GetListFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapGet("",
        async (ISender sender) =>
        {
            var query = new GetListFriend.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}