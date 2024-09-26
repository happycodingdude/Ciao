namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(string conversationId, CreateMessageRequest model) : IRequest<Unit>;

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
            RuleFor(c => c.model).ContactRelatedToConversationWhenSendMessage(_contactRepository, _conversationRepository).DependentRules(() =>
            {
                RuleFor(c => c.conversationId).NotEmpty().WithMessage("Conversation should not be empty");
                RuleFor(c => c.model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

                When(c => c.model.Type == "text", () =>
                {
                    RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
                    RuleFor(c => c.model.Attachments).Empty().WithMessage("Text message should not have attachments");
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

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // _conversationRepository.UseCollection(request.model.Moderator);
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            // When a message sent, all members of that group will be having that group conversation back
            var conversation = await _conversationRepository.GetItemAsync(filter);
            // Add message
            var user = await _contactRepository.GetInfoAsync();
            var message = _mapper.Map<CreateMessageRequest, Message>(request.model);
            message.Contact = new Message_Contact
            {
                Id = user.Id,
                Name = user.Name,
                Avatar = user.Avatar,
            };
            conversation.Messages.Add(message);
            // Update participants
            foreach (var participant in conversation.Participants)
                participant.IsDeleted = false;
            // Update conversation
            var updates = Builders<Conversation>.Update
                .Set(q => q.Messages, conversation.Messages)
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.Update(filter, updates);

            // Push message            
            var notify = _mapper.Map<Message, MessageToNotify>(message);
            notify.ConversationId = conversation.Id;
            await _notificationMethod.Notify(
                "NewMessage",
                conversation.Participants
                    .Where(q => q.Contact.Id != user.Id)
                    .Select(q => q.Contact.Id)
                .ToArray(),
                notify
            );

            return Unit.Value;
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("/{conversationId}/messages",
        async (ISender sender, string conversationId, CreateMessageRequest model) =>
        {
            model.ConversationId = conversationId;
            var query = new SendMessage.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}