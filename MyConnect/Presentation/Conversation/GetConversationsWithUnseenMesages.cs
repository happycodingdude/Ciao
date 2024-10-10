namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int page) : IRequest<GetConversationsWithUnseenMesagesResponse>;

    internal sealed class Handler : IRequestHandler<Request, GetConversationsWithUnseenMesagesResponse>
    {
        readonly IConversationRepository _conversationRepository;

        public Handler(IService<IConversationRepository> service)
        {
            _conversationRepository = service.Get();
        }

        public async Task<GetConversationsWithUnseenMesagesResponse> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _conversationRepository.GetConversationsWithUnseenMesages(new PagingParam(request.page));
        }
    }
}

public class GetConversationsWithUnseenMesagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("",
        async (ISender sender, int page = AppConstants.DefaultPage) =>
        {
            var query = new GetConversationsWithUnseenMesages.Request(page);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}