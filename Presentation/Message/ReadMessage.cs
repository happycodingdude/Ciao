namespace Presentation.Messages;

public static class ReadMessage
{
    public record Request(string conversationId, ReadMessageReq model) : IRequest<bool>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).ContactRelatedToConversation(contactRepository, conversationRepository);
            RuleFor(c => c.model.MessageId).NotEmpty();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, bool>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer, MemberCache memberCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
            _memberCache = memberCache;
        }

        public async Task<bool> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();

            await _kafkaProducer.ProduceAsync(Topic.MessageRead, new MessageReadModel
            {
                UserId = userId,
                ConversationId = request.conversationId,
                MessageId = request.model.MessageId,
                ReadTime = request.model.ReadTime
            });

            await _memberCache.MemberSeenAll(request.conversationId, request.model.ReadTime, request.model.MessageId);

            return true;
        }
    }
}

public class ReadMessageReq
{
    public string MessageId { get; set; } = null!;
    public DateTime ReadTime { get; set; }
}

public class ReadMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages/read",
        async (ISender sender, string conversationId, ReadMessageReq model) =>
        {
            var result = await sender.Send(new ReadMessage.Request(conversationId, model));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
