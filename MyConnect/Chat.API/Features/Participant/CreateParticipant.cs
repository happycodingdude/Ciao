namespace Chat.API.Features.Participants;

public static class CreateParticipant
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public List<ParticipantDto> Model { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Id).NotEmpty().WithMessage("ConversationId should not be empty");
            RuleFor(c => c.Model).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.Model.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.Model.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IParticipantService _service;
        private readonly IValidator<Query> _validator;

        public Handler(IParticipantService service, IValidator<Query> validator)
        {
            _service = service;
            _validator = validator;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _service.AddAsync(request.Id, request.Model);
            return Unit.Value;
        }
    }
}

public class CreateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("/{id}/participants",
        async (ISender sender, Guid id, List<ParticipantDto> model, bool includeNotify = false) =>
        {
            var query = new CreateParticipant.Query
            {
                Id = id,
                Model = model
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}