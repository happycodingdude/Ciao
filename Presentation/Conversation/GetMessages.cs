namespace Presentation.Conversations;

public static class GetMessages
{
    public record Request(string id, int page, int limit) : IRequest<MessagesWithHasMore>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, MessagesWithHasMore>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly MessageCache _messageCache;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            IMapper mapper,
            MessageCache messageCache,
            MemberCache memberCache)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _mapper = mapper;
            _messageCache = messageCache;
            _memberCache = memberCache;
        }

        public async Task<MessagesWithHasMore> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();

            // Nguồn đọc chính là Redis message cache. Fallback Mongo khi cache LẠNH (null/rỗng):
            // cache chỉ được build đầy đủ lúc user.login (offline→online) — reload trang không re-signin,
            // và luồng rejoin nhóm chỉ append 1 dòng hệ thống chứ không nạp lại lịch sử. Nếu không fallback,
            // thành viên vừa vào lại (hoặc bất kỳ hội thoại nào có cache bị evict) sẽ thấy TRỐNG tin nhắn
            // dù Mongo vẫn còn đủ. Fallback đồng thời warm lại cache để các lần đọc sau (và reaction/pin) đúng.
            var message = await _messageCache.GetMessages(request.id);
            if (message is null || message.Count == 0)
                message = await LoadFromStoreAndWarmCache(request.id);

            var paging = new PagingParam(request.page, request.limit);
            var pagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.Skip).Take(paging.Limit).ToList();
            var nextPagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.NextSkip).Take(paging.Limit).ToList();
            var result = _mapper.Map<List<MessageReactionSummary>>(pagedMessages);
            for (int i = 0; i < result.Count; i++)
                result[i].CurrentReaction = pagedMessages[i].Reactions.SingleOrDefault(q => q.ContactId == userId)?.Type;

            return new MessagesWithHasMore
            {
                Messages = result.OrderBy(q => q.CreatedTime).ToList(),
                HasMore = nextPagedMessages.Any()
            };
        }

        // Đọc lịch sử từ Mongo (source-of-truth) rồi warm lại cache. Tính sẵn reaction count để
        // khớp shape cache warm lúc login. Recall đã clear Content/Attachments ở Mongo (HandleMessageRecalled)
        // nên không lộ nội dung đã thu hồi. Cache trống thật (hội thoại chưa có tin) → trả list rỗng.
        async Task<List<MessageWithReactions>> LoadFromStoreAndWarmCache(string conversationId)
        {
            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(conversationId));
            if (conversation?.Messages is null || conversation.Messages.Count == 0)
                return new List<MessageWithReactions>();

            var messages = _mapper.Map<List<MessageWithReactions>>(conversation.Messages);
            foreach (var m in messages)
            {
                m.LikeCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Like);
                m.LoveCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Love);
                m.CareCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Care);
                m.WowCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Wow);
                m.SadCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Sad);
                m.AngryCount = m.Reactions.Count(r => r.Type == AppConstants.MessageReactionType_Angry);
            }

            await _messageCache.SetMessages(conversationId, messages);
            return messages;
        }
    }
}

public class GetMessagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}/messages",
        async (ISender sender, string id, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new GetMessages.Request(id, page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}