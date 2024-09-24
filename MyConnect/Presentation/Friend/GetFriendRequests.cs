namespace Presentation.Friends;

public static class GetFriendRequests
{
    public record Request() : IRequest<IEnumerable<Friend>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<Friend>>
    {
        readonly IFriendRepository _friendRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IService<IFriendRepository> friendService, IService<IContactRepository> contactService)
        {
            _friendRepository = friendService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<IEnumerable<Friend>> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Friend>.Filter.Where(q => q.FromContact.ContactId == user.Id || q.ToContact.ContactId == user.Id);
            return await _friendRepository.GetAllAsync(filter);
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