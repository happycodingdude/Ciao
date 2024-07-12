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
            RuleFor(c => c.Model.Type).NotEmpty().WithMessage("Message type should not be empty");
            RuleFor(c => c.Model.Content).NotEmpty().When(q => q.Model.Type == "text").WithMessage("Text message should have content");
            RuleFor(c => c.Model.Attachments).NotEmpty().When(q => q.Model.Type == "media").WithMessage("Media message should have attachments")
                .DependentRules(() =>
                {
                    RuleFor(c => c.Model.Attachments).Must(q => q.All(w => w.Type == "image" || w.Type == "file")).WithMessage("Attachment type should be image or file");
                    RuleFor(c => c.Model.Attachments).Must(q => q.All(w => !string.IsNullOrEmpty(w.MediaUrl))).WithMessage("Attachment url should not be empty");
                    RuleFor(c => c.Model.Attachments).Must(q => q.All(w => !string.IsNullOrEmpty(w.MediaName))).WithMessage("Attachment name should not be empty");
                    RuleFor(c => c.Model.Attachments).Must(q => q.All(w => w.MediaSize > 0)).WithMessage("Attachment size should not be 0");
                });
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IValidator<Query> _validator;

        public Handler(AppDbContext dbContext, IUnitOfWork uow, IMapper mapper, IValidator<Query> validator)
        {
            _dbContext = dbContext;
            _uow = uow;
            _mapper = mapper;
            _validator = validator;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = _mapper.Map<MessageDto, Message>(request.Model);
            _uow.Message.Add(entity);

            // Update UpdatedTime of conversation to popup as first item when reload
            var conversation = await _uow.Conversation.GetByIdAsync(request.Model.ConversationId);
            _uow.Conversation.Update(conversation);

            await _uow.SaveAsync();

            // When a message sent, all members of that group will be having that group conversation back
            await _dbContext.Set<Participant>().Where(q => q.ConversationId == request.Model.ConversationId)
                .ExecuteUpdateAsync(q => q.SetProperty(w => w.IsDeleted, false));

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