namespace Presentation.Conversations;

public static class GetConversations
{
    public record Request(int page, int limit) : IRequest<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>>;

    internal sealed class Handler : IRequestHandler<Request, List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>>
    {
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly ConversationCache _conversationCache;
        readonly MemberCache _memberCache;

        public Handler(IContactRepository contactRepository, IMapper mapper, ConversationCache conversationCache, MemberCache memberCache)
        {
            _contactRepository = contactRepository;
            _mapper = mapper;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
        }

        public async Task<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>> Handle(Request request, CancellationToken cancellationToken)
        {
            var conversations = await _conversationCache.GetConversations();
            var result = _mapper.Map<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>>(conversations);
            await _memberCache.GetMembers(result);
            return result;
            // return result.Where(q => q.Participants.SingleOrDefault(q => q.Contact.Id == _contactRepository.GetUserId()).IsDeleted == false).ToList();
        }
    }
}

public class GetConversationsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("",
        async (ISender sender, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new GetConversations.Request(page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}