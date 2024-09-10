namespace Presentation.Conversations;

public static class GetById
{
    public record Request(string id) : IRequest<Conversation>;

    internal sealed class Handler : IRequestHandler<Request, Conversation>
    {
        private readonly IConversationRepository conversationRepository;

        public Handler(IServiceScopeFactory scopeFactory)
        {
            using (var scope = scopeFactory.CreateScope())
            {
                conversationRepository = scope.ServiceProvider.GetService<IConversationRepository>();
            }
        }

        public async Task<Conversation> Handle(Request request, CancellationToken cancellationToken)
        {
            return await conversationRepository.GetItemAsync(MongoQuery.IdFilter<Conversation>(request.id));
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