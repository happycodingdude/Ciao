namespace Presentation.Friends;

public static class GetById
{
    public record Request(string id) : IRequest<Friend>;

    internal sealed class Handler : IRequestHandler<Request, Friend>
    {
        private readonly IFriendRepository _friendRepository;

        public Handler(IUnitOfWork uow)
        {
            _friendRepository = uow.GetService<IFriendRepository>();
        }

        public async Task<Friend> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery<Friend>.IdFilter(request.id);
            return await _friendRepository.GetItemAsync(filter);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapGet("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}