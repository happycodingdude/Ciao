namespace Presentation.Friends;

public static class GetById
{
    public record Request(Guid id) : IRequest<Friend>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, Friend>
    {
        public async Task<Friend> Handle(Request request, CancellationToken cancellationToken)
        {
            return await uow.Friend.GetItemAsync(d => d.Id == request.id.ToString());
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