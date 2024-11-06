namespace Presentation.Friends;

public static class GetListFriend
{
    public record Request() : IRequest<IEnumerable<GetListFriendItem>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<GetListFriendItem>>
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

        public async Task<IEnumerable<GetListFriendItem>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _friendRepository.GetListFriend();
        }
    }
}

public class GetListFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapGet("",
        async (ISender sender) =>
        {
            var query = new GetListFriend.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}