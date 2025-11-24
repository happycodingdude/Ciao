namespace Presentation.Conversations;

public static class GetConversations
{
    public record Request(int page, int limit) : IRequest<List<GetConversationsResponse>>;

    internal sealed class Handler : IRequestHandler<Request, List<GetConversationsResponse>>
    {
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly ConversationCache _conversationCache;
        readonly MemberCache _memberCache;
        readonly FriendCache _friendCache;
        readonly MessageCache _messageCache;
        readonly IRedisCaching _redisCaching;

        public Handler(IContactRepository contactRepository, IMapper mapper, ConversationCache conversationCache, MemberCache memberCache, FriendCache friendCache, MessageCache messageCache, IRedisCaching redisCaching)
        {
            _contactRepository = contactRepository;
            _mapper = mapper;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
            _friendCache = friendCache;
            _messageCache = messageCache;
            _redisCaching = redisCaching;
        }

        public async Task<List<GetConversationsResponse>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var conversations = await _conversationCache.GetConversations();
            var result = _mapper.Map<List<GetConversationsResponse>>(conversations);
            await _memberCache.GetMembers(result);
            var friends = await _friendCache.GetFriends();
            foreach (var conversation in result)
            {
                var messages = await _messageCache.GetMessages(conversation.Id);
                var thisMember = conversation.Members.SingleOrDefault(q => q.Contact.Id == userId);
                var haventSeenAnyMessage = messages.Any() && thisMember.LastSeenTime is null;
                var haventSeenLastMessage = messages.Any(q => q.ContactId != userId && q.CreatedTime >= thisMember.LastSeenTime);
                conversation.UnSeen = haventSeenAnyMessage || haventSeenLastMessage;
                foreach (var member in conversation.Members)
                {
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
                        member.DirectConversation = friend.DirectConversation;
                    }
                }

                // Cập nhật trạng thái online dựa theo cache ìnfo
                var redisKeys = conversation.Members.Select(mem => (RedisKey)$"user-{mem.Contact.Id}-info").ToArray();
                var values = await _redisCaching.GetAsync(redisKeys);
                for (int i = 0; i < conversation.Members.Count; i++)
                    conversation.Members[i].Contact.IsOnline = values[i].HasValue;
            }
            return result;
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