namespace Presentation.Messages;

public static class ReactMessage
{
    public record Request(string conversationId, string id, string type) : IRequest<Unit>;

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
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository, IContactRepository contactRepository)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Ensure Reactions is an empty array if not present
            var initializationFilter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
                Builders<Conversation>.Filter.ElemMatch(q => q.Messages,
                    w => w.Id == request.id && (w.Reactions == null || !w.Reactions.Any()))
            );
            var initializeReactions = Builders<Conversation>.Update.Set(
                "Messages.$.Reactions",
                new List<MessageReaction>()
            );
            _conversationRepository.UpdateNoTrackingTime(initializationFilter, initializeReactions);

            var key = Guid.NewGuid();
            // Update if exists
            var conversationFilter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
                Builders<Conversation>.Filter.ElemMatch(q => q.Messages, w => w.Id == request.id)
            ); ;
            var updates = Builders<Conversation>.Update.Set("Messages.$.Reactions.$[elem].Type", request.type);
            var userId = _contactRepository.GetUserId();
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.ContactId", userId)
                );
            _conversationRepository.Update(key, conversationFilter,
                Builders<Conversation>.Update.Combine(updates),
                arrayFilter);

            // Fallback: add a new reaction if it doesn't exist
            var fallbackFilter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
                Builders<Conversation>.Filter.ElemMatch(
                    c => c.Messages,
                    Builders<Message>.Filter.And(
                        Builders<Message>.Filter.Eq(m => m.Id, request.id),
                        Builders<Message>.Filter.Not(
                            Builders<Message>.Filter.ElemMatch(m => m.Reactions, r => r.ContactId == userId)
                        )
                    )
                )
            );
            var create = Builders<Conversation>.Update.Push(
                "Messages.$.Reactions",
                new MessageReaction
                {
                    ContactId = userId,
                    Type = request.type
                }
            );
            _conversationRepository.AddFallback(key, fallbackFilter, create);

            return Unit.Value;
        }
    }
}

public class ReactMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/react",
        async (ISender sender, string conversationId, string id, string type = null) =>
        {
            var query = new ReactMessage.Request(conversationId, id, type);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}