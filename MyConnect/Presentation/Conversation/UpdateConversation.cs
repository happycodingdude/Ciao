
namespace Presentation.Conversations;

public static class UpdateConversation
{
    public record Request(Guid id, JsonPatchDocument patch) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.patch.Operations.Where(q => q.path.ToLower() == nameof(ConversationDto.Title).ToLower()).Select(q => q.value.ToString()))
                .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
                .WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IConversationService service) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await service.PatchAsync(request.id, request.patch);

            return Unit.Value;
        }
    }
}

public class UpdateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPatch("/{id}",
        async (Guid id, JsonElement jsonElement, ISender sender) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateConversation.Request(id, patch);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}