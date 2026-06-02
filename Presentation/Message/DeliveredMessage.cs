namespace Presentation.Messages;

public static class DeliveredMessage
{
    public record Request(string conversationId, DeliveredMessageReq model) : IRequest<bool>;

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

            await _kafkaProducer.ProduceAsync(Topic.MessageDelivered, new MessageDeliveredModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                MessageId = request.model.MessageId,
                DeliveredTime = request.model.DeliveredTime
            });

            // Cập nhật cache ngay tại API call để UI đa thiết bị của chính user phản ánh nhanh.
            // Consistency-check: cache có thể tạm sai do race; Mongo qua DataStoreConsumer là source-of-truth.
            await _memberCache.MemberDelivered(request.conversationId, request.model.MessageId, request.model.DeliveredTime);

            return true;
        }
    }
}

public class DeliveredMessageReq
{
    public string MessageId { get; set; } = null!;
    public DateTime DeliveredTime { get; set; }
}

public class DeliveredMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages/delivered",
        async (ISender sender, string conversationId, DeliveredMessageReq model) =>
        {
            var result = await sender.Send(new DeliveredMessage.Request(conversationId, model));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
