namespace Presentation.Conversations;

public static class GetById
{
    public record Request(string id, int page, int limit) : IRequest<ConversationWithMessages>;

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

    internal sealed class Handler : IRequestHandler<Request, ConversationWithMessages>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IDistributedCache _distributedCache;
        readonly IMapper _mapper;

        public Handler(IValidator<Request> validator,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            IDistributedCache distributedCache,
            IMapper mapper)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _distributedCache = distributedCache;
            _mapper = mapper;
        }

        public async Task<ConversationWithMessages> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var cachedData = await _distributedCache.GetStringAsync($"conversations-{userId}");
            var conversations = JsonConvert.DeserializeObject<IEnumerable<ConversationWithTotalUnseen>>(cachedData);
            var conversation = conversations.SingleOrDefault(q => q.Id == request.id);

            // Update db
            SeenAll(conversation);

            // Update cache
            conversation.UnSeenMessages = 0;
            await _distributedCache.SetStringAsync($"conversations-{userId}", JsonConvert.SerializeObject(conversations));

            // Mapping for response
            var conversationWithMessages = _mapper.Map<ConversationWithMessages>(conversation);
            conversationWithMessages.Messages = conversationWithMessages.Messages.OrderByDescending(q => q.CreatedTime).ToList();
            var paging = new PagingParam(request.page, request.limit);
            var pagedMessages = conversationWithMessages.Messages.Skip(paging.Skip).Take(paging.Limit).ToList();
            var nextPagedMessages = conversationWithMessages.Messages.Skip(paging.NextSkip).Take(paging.Limit).ToList();
            conversationWithMessages.Messages = pagedMessages;
            conversationWithMessages.NextExist = nextPagedMessages.Any();
            return conversationWithMessages;
        }

        void SeenAll(ConversationWithTotalUnseen conversation)
        {
            var userId = _contactRepository.GetUserId();
            // No need to update when all messages were seen
            if (!conversation.Messages.Any(q => q.ContactId != userId && q.Status == "received")) return;

            var filter = MongoQuery<Conversation>.IdFilter(conversation.Id);
            foreach (var unseenMessage in conversation.Messages.Where(q => q.ContactId != userId && q.Status == "received"))
            {
                unseenMessage.Status = "seen";
                unseenMessage.SeenTime = DateTime.Now;
            }
            var updates = Builders<Conversation>.Update.Set(q => q.Messages, _mapper.Map<List<Message>>(conversation.Messages));
            _conversationRepository.UpdateNoTrackingTime(filter, updates);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}",
        async (ISender sender, string id, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new GetById.Request(id, page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}