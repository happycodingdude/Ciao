namespace Presentation.Conversations;

public static class GetMessages
{
    public record Request(string id, int page, int limit) : IRequest<MessagesWithHasMore>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
            }
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

            // Update total unseen messages in cache
            var lastSeenTime = DateTime.Now;
            SeenAll(request.id, lastSeenTime);
            await _memberCache.MemberSeenAll(request.id, lastSeenTime);

            var message = await _messageCache.GetMessages(request.id);
            var paging = new PagingParam(request.page, request.limit);
            var pagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.Skip).Take(paging.Limit).ToList();
            var nextPagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.NextSkip).Take(paging.Limit).ToList();
            var result = _mapper.Map<List<MessageReactionSummary>>(pagedMessages);
            for (int i = 0; i < result.Count; i++)
                result[i].CurrentReaction = pagedMessages[i].Reactions.SingleOrDefault(q => q.ContactId == _contactRepository.GetUserId())?.Type;

            return new MessagesWithHasMore
            {
                Messages = result.OrderBy(q => q.CreatedTime).ToList(),
                HasMore = nextPagedMessages.Any()
            };
        }

        void SeenAll(string conversationId, DateTime time)
        {
            var userId = _contactRepository.GetUserId();
            var conversationFilter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq("_id", conversationId),
                Builders<Conversation>.Filter.Eq("Members.ContactId", userId)
            );
            var conversationUpdates = Builders<Conversation>.Update
                .Set("Members.$[elem].LastSeenTime", time);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.ContactId", userId)
                );
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);
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