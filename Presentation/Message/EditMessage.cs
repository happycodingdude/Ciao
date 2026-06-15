namespace Presentation.Messages;

public static class EditMessage
{
    public record Request(string conversationId, string messageId, EditMessageReq model) : IRequest<bool>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.model.Content).NotEmpty().WithMessage("Content is required");

            RuleFor(c => c).CustomAsync(async (req, ctx, ct) =>
            {
                var userId = contactRepository.GetUserId();
                var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(req.conversationId));

                if (conversation is null || conversation.Members.All(m => m.ContactId != userId))
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
                if (message.ContactId != userId)
                {
                    ctx.AddFailure("Only the sender can edit this message");
                    return;
                }
                if (message.Type != "text")
                {
                    ctx.AddFailure("Only text messages can be edited");
                    return;
                }
                if (message.RecalledTime is not null)
                {
                    ctx.AddFailure("Cannot edit a recalled message");
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
            // Server time là nguồn tin cậy cho EditedTime (idempotency Mongo/cache so theo nó), không tin FE clock.
            var editedTime = DateTime.UtcNow;

            await _kafkaProducer.ProduceAsync(Topic.MessageEdited, new MessageEditedModel
            {
                UserId = userId,
                ConversationId = request.conversationId,
                MessageId = request.messageId,
                Content = request.model.Content,
                EditedTime = editedTime
            });

            // Cập nhật cache ngay tại API call để UI đa thiết bị của sender reflect nhanh.
            // Mongo qua DataStoreConsumer.HandleMessageEdited là source-of-truth.
            await _messageCache.UpdateEdited(request.conversationId, request.messageId, request.model.Content, editedTime);

            return true;
        }
    }
}

public class EditMessageReq
{
    public string Content { get; set; } = null!;
}

public class EditMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("/{conversationId}/messages/{messageId}",
        async (ISender sender, string conversationId, string messageId, EditMessageReq model) =>
        {
            var result = await sender.Send(new EditMessage.Request(conversationId, messageId, model));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
