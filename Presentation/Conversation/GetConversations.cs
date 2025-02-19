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
        readonly FriendCache _friendCache;
        readonly MessageCache _messageCache;

        public Handler(IContactRepository contactRepository, IMapper mapper, ConversationCache conversationCache, MemberCache memberCache, FriendCache friendCache, MessageCache messageCache)
        {
            _contactRepository = contactRepository;
            _mapper = mapper;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
            _friendCache = friendCache;
            _messageCache = messageCache;
        }

        public async Task<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>> Handle(Request request, CancellationToken cancellationToken)
        {
            var conversations = await _conversationCache.GetConversations();
            var result = _mapper.Map<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>>(conversations);
            await _memberCache.GetMembers(result);
            // Console.WriteLine(JsonConvert.SerializeObject(result));
            var friends = await _friendCache.GetFriends();
            foreach (var conversation in result)
            {
                var messages = await _messageCache.GetMessages(conversation.Id);
                foreach (var member in result.SelectMany(q => q.Members))
                {
                    // Set unseen messages properties
                    if (member.LastSeenTime is null)
                    {
                        member.UnSeenMessages = messages.Where(q => q.ContactId != member.Contact.Id).Count();
                    }
                    else
                    {
                        member.UnSeenMessages = messages.Where(q => q.CreatedTime >= member.LastSeenTime).Count();
                    }
                    // Set friend properties
                    var friend = friends.SingleOrDefault(q => q.Contact.Id == member.Contact.Id);
                    if (friend is null)
                    {
                        member.FriendId = null;
                        member.FriendStatus = AppConstants.FriendStatus_New;
                    }
                    else
                    {
                        member.FriendId = friend.FriendId;
                        member.FriendStatus = friend.FriendStatus;
                    }
                }
            }
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