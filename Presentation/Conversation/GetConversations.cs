namespace Presentation.Conversations;

public static class GetConversations
{
    public record Request(int page, int limit) : IRequest<List<GetConversationsResponse>>;

    internal sealed class Handler : IRequestHandler<Request, List<GetConversationsResponse>>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IMapper _mapper;
        readonly ConversationCache _conversationCache;
        readonly MemberCache _memberCache;
        readonly FriendCache _friendCache;
        readonly MessageCache _messageCache;
        readonly IRedisCaching _redisCaching;
        readonly IPresenceService _presenceService;
        readonly UserCache _userCache;

        public Handler(IContactRepository contactRepository, IConversationRepository conversationRepository, IMapper mapper, ConversationCache conversationCache, MemberCache memberCache, FriendCache friendCache, MessageCache messageCache, IRedisCaching redisCaching, IPresenceService presenceService, UserCache userCache)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _mapper = mapper;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
            _friendCache = friendCache;
            _messageCache = messageCache;
            _redisCaching = redisCaching;
            _presenceService = presenceService;
            _userCache = userCache;
        }

        public async Task<List<GetConversationsResponse>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var conversations = await _conversationCache.GetConversations(request.page, request.limit);
            if (!conversations.Any())
            {
                // Truy vấn từ DB nếu cache trống
                var dbConversations = await _conversationRepository.GetConversationsWithUnseenMesages(userId, new PagingParam(request.page, request.limit));
                conversations = _mapper.Map<List<ConversationWithTotalUnseenWithContactInfoAndNoMessage>>(dbConversations);
            }
            var result = _mapper.Map<List<GetConversationsResponse>>(conversations);
            await _memberCache.GetMembers(result);
            var friends = await _friendCache.GetFriends();
            foreach (var conversation in result)
            {
                var messages = await _messageCache.GetMessages(conversation.Id);
                var thisMember = conversation.Members.SingleOrDefault(q => q.Contact.Id == userId);
                // Chỉ tính CHƯA XEM dựa trên tin của NGƯỜI KHÁC. Tin do chính user gửi
                // (vd. vừa tạo hội thoại kèm tin nhắn) không được coi là "chưa xem" của
                // chính họ — nếu không, reload sẽ hiện hội thoại vừa gửi là unseen sai.
                var haventSeenAnyMessage = thisMember!.LastSeenTime is null && messages.Any(q => q.ContactId != userId);
                var haventSeenLastMessage = messages.Any(q => q.ContactId != userId && q.CreatedTime >= thisMember!.LastSeenTime);
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

                // Cập nhật trạng thái online cho các thành viên (đã áp privacy mask ShowOnlineStatus).
                foreach (var member in conversation.Members)
                {
                    member.Contact.IsOnline = await _userCache.IsOnlineVisibleAsync(member.Contact.Id);
                }
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