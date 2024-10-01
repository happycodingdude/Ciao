namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int limit, int page) : IRequest<IEnumerable<object>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<object>>
    {
        readonly IConversationRepository _conversationRepository;

        public Handler(IService<IConversationRepository> service)
        {
            _conversationRepository = service.Get();
        }

        public async Task<IEnumerable<object>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _conversationRepository.GetConversationsWithUnseenMesages(new PagingParam(request.limit, request.page));
        }
    }
}

public class GetConversationsWithUnseenMesagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("",
        async (ISender sender, int limit = AppConstants.DefaultLimit, int page = AppConstants.DefaultPage) =>
        {
            var query = new GetConversationsWithUnseenMesages.Request(limit, page);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}