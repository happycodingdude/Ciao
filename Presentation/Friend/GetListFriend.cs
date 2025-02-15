namespace Presentation.Friends;

public static class GetListFriend
{
    public record Request() : IRequest<IEnumerable<GetListFriendItem>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<GetListFriendItem>>
    {
        readonly IFriendRepository _friendRepository;

        public Handler(IFriendRepository friendRepository)
        {
            _friendRepository = friendRepository;
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
        app.MapGroup(AppConstants.ApiGroup_Friend).MapGet("",
        async (ISender sender) =>
        {
            var query = new GetListFriend.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}