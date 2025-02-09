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

        public Handler(IValidator<Request> validator,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            IMapper mapper,
            MessageCache messageCache)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _mapper = mapper;
            _messageCache = messageCache;
        }

        public async Task<MessagesWithHasMore> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var message = await _messageCache.GetMessages(request.id);
            var paging = new PagingParam(request.page, request.limit);
            var pagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.Skip).Take(paging.Limit);
            var nextPagedMessages = message.OrderByDescending(q => q.CreatedTime).Skip(paging.NextSkip).Take(paging.Limit).ToList();
            return new MessagesWithHasMore
            {
                Messages = pagedMessages.OrderBy(q => q.CreatedTime).ToList(),
                HasMore = nextPagedMessages.Any()
            };
        }

        void SeenAll(ConversationWithTotalUnseenWithContactInfo conversation)
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