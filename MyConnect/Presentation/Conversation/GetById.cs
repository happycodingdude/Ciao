namespace Presentation.Conversations;

public static class GetById
{
    public record Request(string id) : IRequest<Conversation>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, Conversation>
    {
        public async Task<Conversation> Handle(Request request, CancellationToken cancellationToken)
        {
            return await uow.Conversation.GetItemAsync(MongoQuery.IdFilter<Conversation>(request.id));
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}