namespace Presentation.Participants;

public static class CreateParticipant
{
    public record Request(Guid id, List<ParticipantDto> model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.id).NotEmpty().WithMessage("ConversationId should not be empty");
            RuleFor(c => c.model).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
            });
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current participants of conversation, then filter new item to add
            var participants = uow.Participant.GetByConversationId(request.id);
            var filterNewItemToAdd = request.model.Select(q => q.ContactId).ToList().Except(participants.Select(q => q.ContactId).ToList());
            var filteredParticipants = request.model.Where(q => filterNewItemToAdd.Contains(q.ContactId));
            if (!filteredParticipants.Any()) return Unit.Value;

            // Add new participants
            foreach (var item in filteredParticipants)
                item.ConversationId = request.id;
            var participantsToAdd = mapper.Map<List<ParticipantDto>, List<Participant>>(filteredParticipants.ToList());
            uow.Participant.Add(participantsToAdd);
            await uow.SaveAsync();

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
            var query = new CreateParticipant.Request(id, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}