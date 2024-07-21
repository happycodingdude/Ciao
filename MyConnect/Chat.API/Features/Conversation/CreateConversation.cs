namespace Chat.API.Features.Conversations;

public static class CreateConversation
{
    public class Query : IRequest<Unit>
    {
        public ConversationDto Model { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Model.Participants).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.Model.Participants.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.Model.Participants.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c.Model.Participants.Count).GreaterThan(1).When(q => q.Model.IsGroup).WithMessage("Group conversation should contain at least 2 participants");
                RuleFor(c => c.Model.Participants.Count).Equal(2).When(q => !q.Model.IsGroup).WithMessage("Direct conversation should contain 2 participants");
            });
            RuleFor(c => c.Model.Title).NotEmpty().When(q => q.Model.IsGroup).WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IValidator<Query> _validator;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(IValidator<Query> validator, IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _validator = validator;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = _mapper.Map<ConversationDto, Conversation>(request.Model);
            _uow.Conversation.Add(entity);
            await _uow.SaveAsync();
            
            return Unit.Value;
        }
    }
}

public class CreateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("",
        async (ISender sender, ConversationDto model) =>
        {
            var query = new CreateConversation.Query
            {
                Model = model
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}