namespace Presentation.Friends;

public static class GetFriendRequests
{
    public record Request() : IRequest<IEnumerable<FriendWithStatus>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<FriendWithStatus>>
    {
        readonly IMapper _mapper;
        readonly IFriendRepository _friendRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IMapper mapper,
            IService<IFriendRepository> friendService,
            IService<IContactRepository> contactService)
        {
            _mapper = mapper;
            _friendRepository = friendService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<IEnumerable<FriendWithStatus>> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Friend>.Filter.Where(q => q.FromContact.ContactId == user.Id || q.ToContact.ContactId == user.Id);
            var friends = await _friendRepository.GetAllAsync(filter);
            if (!friends.Any()) return Enumerable.Empty<FriendWithStatus>();

            var result = new List<FriendWithStatus>(friends.Count());
            foreach (var friend in friends)
            {
                var friendWithStatus = _mapper.Map<Friend, FriendWithStatus>(friend);
                friendWithStatus.Status = await _friendRepository.GetFriendStatusAsync(friend);
                result.Add(friendWithStatus);
            }

            return result;
        }
    }
}

public class GetFriendRequestsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapGet("",
        async (ISender sender) =>
        {
            var query = new GetFriendRequests.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}