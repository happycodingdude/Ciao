namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(string conversationId, SendMessageReq model) : IRequest<SendMessageRes>;

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
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository).DependentRules(() =>
            {
                // RuleFor(c => c.conversationId).NotEmpty().WithMessage("Conversation should not be empty");
                RuleFor(c => c.model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

                When(c => c.model.Type == "text", () =>
                {
                    RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
                    //RuleFor(c => c.model.Attachments).Empty().WithMessage("Text message should not have attachments");
                });
                When(c => c.model.Type == "media", () =>
                {
                    RuleFor(c => c.model.Attachments).NotEmpty().WithMessage("Media message should have attachments")
                        .DependentRules(() =>
                        {
                            RuleFor(c => c.model.Attachments.Select(q => q.Type)).Must(q => q.All(w => w == "image" || w == "file")).WithMessage("Attachment type should be image or file");
                            RuleFor(c => c.model.Attachments.Select(q => q.MediaUrl)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment url should not be empty");
                            RuleFor(c => c.model.Attachments.Select(q => q.MediaName)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment name should not be empty");
                            RuleFor(c => c.model.Attachments.Select(q => q.MediaSize)).Must(q => q.All(w => w > 0)).WithMessage("Attachment size should not be 0");
                        });
                });
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, SendMessageRes>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;
        readonly INotificationProcessor _notificationProcessor;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer, INotificationProcessor notificationProcessor)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
            _notificationProcessor = notificationProcessor;
        }

        public async Task<SendMessageRes> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _kafkaProducer.ProduceAsync(Topic.SaveNewMessage, new SaveNewMessageModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                Message = request.model
            });

            return new SendMessageRes
            {
                Message = request.model.Id,
                Attachments = request.model.Attachments.Select(q => q.Id).ToArray()
            };
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages",
        async (ISender sender, string conversationId, SendMessageReq model) =>
        {
            var query = new SendMessage.Request(conversationId, model);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}