namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int page, int limit) : IRequest<IEnumerable<ConversationWithTotalUnseen>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<ConversationWithTotalUnseen>>
    {
        readonly IContactRepository _contactRepository;
        readonly IDistributedCache _distributedCache;

        public Handler(IContactRepository contactRepository, IDistributedCache distributedCache)
        {
            _contactRepository = contactRepository;
            _distributedCache = distributedCache;
        }

        public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var cachedData = await _distributedCache.GetStringAsync($"conversations-{userId}");
            return JsonConvert.DeserializeObject<IEnumerable<ConversationWithTotalUnseen>>(cachedData);
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