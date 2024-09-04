
namespace Presentation.Conversations;

public static class UpdateConversation
{
    public record Request(string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            // RuleFor(c => c.patch.Operations.Where(q => q.path.ToLower() == nameof(ConversationDto.Title).ToLower()).Select(q => q.value.ToString()))
            //     .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
            //     .WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery.IdFilter<Conversation>(request.id);
            var entity = await uow.Conversation.GetItemAsync(filter);
            await uow.Conversation.UpdateOneAsync(filter, entity);

            return Unit.Value;
        }
    }
}

public class UpdateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPatch("/{id}",
        async (string id, ISender sender) =>
        {
            var query = new UpdateConversation.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}