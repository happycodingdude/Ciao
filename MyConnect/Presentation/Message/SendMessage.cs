namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(string conversationId, Message model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.conversationId).NotEmpty().WithMessage("Conversation should not be empty");
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
        readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly INotificationMethod _notificationMethod;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            INotificationMethod notificationMethod,
            IService service)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _notificationMethod = notificationMethod;
            _conversationRepository = service.Get<IConversationRepository>();
            _contactRepository = service.Get<IContactRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = await _contactRepository.GetInfoAsync();

            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            // When a message sent, all members of that group will be having that group conversation back
            var conversation = await _conversationRepository.GetItemAsync(filter);
            // Add message
            request.model.Contact = new Message_Contact
            {
                Id = user.Id,
                Name = user.Name,
                Avatar = user.Avatar,
            };
            // request.model.Contact.Name = contact.Name;
            // request.model.Contact.Avatar = contact.Avatar;
            conversation.Messages.Add(request.model);
            // Update participants
            foreach (var participant in conversation.Participants)
                participant.IsDeleted = false;
            var updates = Builders<Conversation>.Update
                .Set(q => q.Messages, conversation.Messages)
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.Update(filter, updates);

            // Push message
            // var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();
            // await _notificationMethod.Notify(
            //     "NewMessage",
            //     conversation.Participants
            //         .Where(q => q.Contact.Id != userId)
            //         .Select(q => q.Contact.Id)
            //     .ToArray(),
            //     request.model
            // );

            return Unit.Value;
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("/{conversationId}/messages",
        async (ISender sender, string conversationId, Message model) =>
        {
            var query = new SendMessage.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}