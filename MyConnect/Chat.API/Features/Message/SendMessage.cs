namespace Chat.API.Features.Conversations;

public static class SendMessage
{
    public class Query : IRequest<Unit>
    {
        public MessageDto Model { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Model.ConversationId).NotEmpty().WithMessage("Conversation should not be empty");
            RuleFor(c => c.Model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

            When(c => c.Model.Type == "text", () =>
            {
                RuleFor(c => c.Model.Content).NotEmpty().WithMessage("Text message should have content");
            });
            When(c => c.Model.Type == "media", () =>
            {
                RuleFor(c => c.Model.Attachments).NotEmpty().WithMessage("Media message should have attachments")
                    .DependentRules(() =>
                    {
                        RuleFor(c => c.Model.Attachments.Select(q => q.Type)).Must(q => q.All(w => w == "image" || w == "file")).WithMessage("Attachment type should be image or file");
                        RuleFor(c => c.Model.Attachments.Select(q => q.MediaUrl)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment url should not be empty");
                        RuleFor(c => c.Model.Attachments.Select(q => q.MediaName)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment name should not be empty");
                        RuleFor(c => c.Model.Attachments.Select(q => q.MediaSize)).Must(q => q.All(w => w > 0)).WithMessage("Attachment size should not be 0");
                    });
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IValidator<Query> _validator;
        private readonly INotificationMethod _notificationMethod;

        public Handler(AppDbContext dbContext, IUnitOfWork uow, IMapper mapper, IValidator<Query> validator, INotificationMethod notificationMethod)
        {
            _dbContext = dbContext;
            _uow = uow;
            _mapper = mapper;
            _validator = validator;
            _notificationMethod = notificationMethod;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // // Add message
            var entity = _mapper.Map<MessageDto, Message>(request.Model);
            _uow.Message.Add(entity);
            // Update UpdatedTime of conversation to popup as first item when reload
            var conversation = await _uow.Conversation.GetByIdAsync(request.Model.ConversationId);
            _uow.Conversation.Update(conversation);

            await _uow.SaveAsync();

            // When a message sent, all members of that group will be having that group conversation back
            await _dbContext.Set<Participant>().Where(q => q.ConversationId == request.Model.ConversationId)
                .ExecuteUpdateAsync(q => q.SetProperty(w => w.IsDeleted, false));

            // Push message
            await _notificationMethod.Notify(
                "NewMessage",
                _uow.Participant
                    .GetByConversationId(request.Model.ConversationId)
                    .Where(q => q.ContactId != request.Model.ContactId)
                    .Select(q => q.ContactId.ToString())
                .ToArray(),
                _mapper.Map<Message, MessageToNotify>(entity)
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
        async (HttpContext context, ISender sender, MessageDto model) =>
        {
            model.ContactId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new SendMessage.Query
            {
                Model = model
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}