namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int page, int limit) : IRequest<IEnumerable<ConversationWithTotalUnseen>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<ConversationWithTotalUnseen>>
    {
        readonly IConversationRepository _conversationRepository;

        public Handler(IService<IConversationRepository> service)
        {
            _conversationRepository = service.Get();
        }

        public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _conversationRepository.GetConversationsWithUnseenMesages(new PagingParam(request.page, request.limit));
        }
    }
}

public class GetConversationsWithUnseenMesagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("",
        async (ISender sender, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new GetConversationsWithUnseenMesages.Request(page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}