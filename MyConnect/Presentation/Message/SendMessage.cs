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
        private readonly IValidator<Request> validator;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly INotificationMethod notificationMethod;
        private readonly IUnitOfWork uow;
        private readonly IConversationRepository conversationRepository;
        private readonly IMessageRepository messageRepository;

        public Handler(IValidator<Request> validator, IHttpContextAccessor httpContextAccessor, IServiceScopeFactory scopeFactory,
            INotificationMethod notificationMethod, IUnitOfWork uow)
        {
            this.validator = validator;
            this.httpContextAccessor = httpContextAccessor;
            this.notificationMethod = notificationMethod;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                conversationRepository = scope.ServiceProvider.GetService<IConversationRepository>();
                messageRepository = scope.ServiceProvider.GetService<IMessageRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add message
            messageRepository.Add(request.model);
            // When a message sent, all members of that group will be having that group conversation back
            var filter = MongoQuery.IdFilter<Conversation>(request.model.ConversationId);
            var conversation = await conversationRepository.GetItemAsync(filter);
            foreach (var participant in conversation.Participants)
                participant.IsDeleted = false;
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            conversationRepository.Update(filter, updates);

            await uow.SaveAsync();

            // Push message
            var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");
            await notificationMethod.Notify(
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