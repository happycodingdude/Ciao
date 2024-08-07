namespace Presentation.Participants;

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
        private readonly IValidator<Query> _validator;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(IValidator<Query> validator, IUnitOfWork uow, IMapper mapper)
        {
            _validator = validator;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current participants of conversation, then filter new item to add
            var participants = _uow.Participant.GetByConversationId(request.Id);
            var filterNewItemToAdd = request.Model.Select(q => q.ContactId).ToList().Except(participants.Select(q => q.ContactId).ToList());
            var filteredParticipants = request.Model.Where(q => filterNewItemToAdd.Contains(q.ContactId));
            if (!filteredParticipants.Any()) return Unit.Value;

            // Add new participants
            foreach (var item in filteredParticipants)
                item.ConversationId = request.Id;
            var participantsToAdd = _mapper.Map<List<ParticipantDto>, List<Participant>>(filteredParticipants.ToList());
            _uow.Participant.Add(participantsToAdd);
            await _uow.SaveAsync();

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