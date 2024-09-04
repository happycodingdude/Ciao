namespace Presentation.Conversations;

public static class CreateConversation
{
    public record Request(Conversation model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Participants).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Participants.Select(q => q.Contact.Id).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Participants.Select(q => q.Contact.Id).ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c.model.Participants.Count).GreaterThan(1).When(q => q.model.IsGroup).WithMessage("Group conversation should contain at least 2 participants");
                RuleFor(c => c.model.Participants.Count).Equal(2).When(q => !q.model.IsGroup).WithMessage("Direct conversation should contain 2 participants");
                RuleFor(c => c.model.Participants.Where(q => q.IsModerator).Count()).Equal(1).WithMessage("Conversation should only have 1 moderator");
            });
            RuleFor(c => c.model.Title).NotEmpty().When(q => q.model.IsGroup).WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod, IHttpContextAccessor httpContextAccessor)
        : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");
            // var entity = mapper.Map<ConversationDto, Conversation>(request.model);
            // uow.Conversation.Add(entity);
            // await uow.SaveAsync();
            await uow.Conversation.AddAsync(request.model);

            await notificationMethod.Notify(
                "NewConversation",
                request.model.Participants
                    .Where(q => q.Contact.Id != userId)
                    .Select(q => q.Contact.Id)
                    .ToArray(),
                request.model
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
        async (ISender sender, Conversation model) =>
        {
            var query = new CreateConversation.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}