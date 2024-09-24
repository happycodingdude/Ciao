namespace Presentation.Conversations;

public static class GetById
{
    public record Request(string id) : IRequest<Conversation>;

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

    internal sealed class Handler : IRequestHandler<Request, Conversation>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService)
        {
            _validator = validator;
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<Conversation> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(request.id));
            await SeenAll(conversation);
            return conversation;
        }

        async Task SeenAll(Conversation conversation)
        {
            var user = await _contactRepository.GetInfoAsync();
            // No need to update when all messages were seen
            if (!conversation.Messages.Any(q => q.Contact.Id != user.Id && q.Status == "received")) return;

            var filter = MongoQuery<Conversation>.IdFilter(conversation.Id);
            foreach (var unseenMessage in conversation.Messages.Where(q => q.Contact.Id != user.Id && q.Status == "received"))
            {
                unseenMessage.Status = "seen";
                unseenMessage.SeenTime = DateTime.Now;
            }
            var updates = Builders<Conversation>.Update
                .Set(q => q.Messages, conversation.Messages);
            _conversationRepository.Update(filter, updates);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}