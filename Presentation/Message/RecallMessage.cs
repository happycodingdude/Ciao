namespace Presentation.Messages;

public static class RecallMessage
{
    public record Request(string conversationId, string messageId) : IRequest<bool>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c).CustomAsync(async (req, ctx, ct) =>
            {
                var userId = contactRepository.GetUserId();
                var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(req.conversationId));

                var member = conversation?.Members.FirstOrDefault(m => m.ContactId == userId);
                if (conversation is null || member is null)
                {
                    ctx.AddFailure("Not related to this conversation");
                    return;
                }

                var message = conversation.Messages.FirstOrDefault(m => m.Id == req.messageId);
                if (message is null)
                {
                    ctx.AddFailure("Message not found");
                    return;
                }
                if (message.Type == "system")
                {
                    ctx.AddFailure("System messages cannot be recalled");
                    return;
                }
                if (message.RecalledTime is not null)
                {
                    ctx.AddFailure("Message has already been recalled");
                    return;
                }
                if (message.ContactId != userId)
                {
                    ctx.AddFailure("Only the sender can recall this message");
                    return;
                }
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, bool>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;
        readonly MessageCache _messageCache;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer, MessageCache messageCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
            _messageCache = messageCache;
        }

        public async Task<bool> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var recalledTime = DateTime.UtcNow;

            await _kafkaProducer.ProduceAsync(Topic.MessageRecalled, new MessageRecalledModel
            {
                UserId = userId,
                ConversationId = request.conversationId,
                MessageId = request.messageId,
                RecalledTime = recalledTime,
                RecalledByContactId = userId
            });

            // Cập nhật cache ngay: clear content/attachments, set recalled, auto-unpin,
            // và đổi LastMessage của conversation về placeholder nếu đây là tin cuối.
            // Mongo qua DataStoreConsumer.HandleMessageRecalled là source-of-truth.
            await _messageCache.UpdateRecalled(request.conversationId, request.messageId, recalledTime, userId);

            return true;
        }
    }
}

public class RecallMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages/{messageId}/recall",
        async (ISender sender, string conversationId, string messageId) =>
        {
            var result = await sender.Send(new RecallMessage.Request(conversationId, messageId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
