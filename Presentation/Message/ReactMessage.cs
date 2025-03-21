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
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _kafkaProducer.ProduceAsync(Topic.NewReaction, new NewReactionModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                MessageId = request.id,
                Type = request.type
            });

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