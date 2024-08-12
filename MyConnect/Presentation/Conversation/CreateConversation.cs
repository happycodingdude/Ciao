namespace Presentation.Conversations;

public static class CreateConversation
{
    public record Request(Guid contactId, ConversationDto model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Participants).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Participants.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Participants.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c.model.Participants.Count).GreaterThan(1).When(q => q.model.IsGroup).WithMessage("Group conversation should contain at least 2 participants");
                RuleFor(c => c.model.Participants.Count).Equal(2).When(q => !q.model.IsGroup).WithMessage("Direct conversation should contain 2 participants");
                RuleFor(c => c.model.Participants.Where(q => q.IsModerator).Count()).Equal(1).WithMessage("Conversation should only have 1 moderator");
            });
            RuleFor(c => c.model.Title).NotEmpty().When(q => q.model.IsGroup).WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = mapper.Map<ConversationDto, Conversation>(request.model);
            uow.Conversation.Add(entity);
            await uow.SaveAsync();

            await notificationMethod.Notify(
                "NewConversation",
                request.model.Participants
                    .Where(q => q.ContactId != request.contactId)
                    .Select(q => q.ContactId.ToString())
                    .ToArray(),
                mapper.Map<Conversation, ConversationToNotify>(entity)
            );

            return Unit.Value;
        }
    }
}

public class CreateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("",
        async (HttpContext context, ISender sender, ConversationDto model) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CreateConversation.Request(userId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}