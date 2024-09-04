namespace Presentation.Contacts;

public static class UpdateContact
{
    public record Request(Guid id, JsonPatchDocument patch) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.patch.Operations.Where(q => q.path.ToLower() == nameof(ContactDto.Name).ToLower()).Select(q => q.value.ToString()))
                .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
                .WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            //await service.PatchAsync(request.id, request.patch);

            return Unit.Value;
        }
    }
}

public class UpdateContactEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPatch("",
        async (HttpContext context, JsonElement jsonElement, ISender sender) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateContact.Request(userId, patch);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}