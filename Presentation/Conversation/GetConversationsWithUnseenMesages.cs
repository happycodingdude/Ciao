namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int page, int limit) : IRequest<List<ConversationCacheModel>>;

    internal sealed class Handler : IRequestHandler<Request, List<ConversationCacheModel>>
    {
        readonly ConversationCache _conversationCache;

        public Handler(ConversationCache conversationCache)
        {
            _conversationCache = conversationCache;
        }

        public async Task<List<ConversationCacheModel>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _conversationCache.GetConversations();
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