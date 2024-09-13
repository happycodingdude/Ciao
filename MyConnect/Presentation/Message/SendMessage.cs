namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(Message model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.ConversationId).NotEmpty().WithMessage("Conversation should not be empty");
            RuleFor(c => c.model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

            When(c => c.model.Type == "text", () =>
            {
                RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
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
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationMethod _notificationMethod;
        private readonly IConversationRepository _conversationRepository;
        private readonly IMessageRepository _messageRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            INotificationMethod notificationMethod,
            IUnitOfWork uow)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _notificationMethod = notificationMethod;
            _conversationRepository = uow.GetService<IConversationRepository>();
            _messageRepository = uow.GetService<IMessageRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add message
            _messageRepository.Add(request.model);
            // When a message sent, all members of that group will be having that group conversation back
            var filter = MongoQuery<Conversation>.IdFilter(request.model.ConversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            foreach (var participant in conversation.Participants)
                participant.IsDeleted = false;
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.Update(filter, updates);

            // Push message
            var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();
            await _notificationMethod.Notify(
                "NewMessage",
                conversation.Participants
                    .Where(q => q.Contact.Id != userId)
                    .Select(q => q.Contact.Id)
                .ToArray(),
                request.model
            );

            return Unit.Value;
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Message).MapPost("/send",
        async (ISender sender, Message model) =>
        {
            var query = new SendMessage.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}