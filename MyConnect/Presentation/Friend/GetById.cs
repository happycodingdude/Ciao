namespace Presentation.Friends;

public static class GetById
{
    public record Request(Guid id) : IRequest<FriendDto>;

    internal sealed class Handler(IFriendService service) : IRequestHandler<Request, FriendDto>
    {
        public async Task<FriendDto> Handle(Request request, CancellationToken cancellationToken)
        {
            return await service.GetByIdAsync(request.id);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapGet("/{id}",
        async (ISender sender, Guid id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}