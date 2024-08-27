namespace Presentation.Notifications;

public static class UpdateNotification
{
    public record Request(Guid id, JsonPatchDocument patch) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
        }
    }

    // internal sealed class Handler(IValidator<Request> validator, INotificationService service) : IRequestHandler<Request, Unit>
    // {
    //     public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
    //     {
    //         var validationResult = validator.Validate(request);
    //         if (!validationResult.IsValid)
    //             throw new BadRequestException(validationResult.ToString());

    //         await service.PatchAsync(request.id, request.patch);

    //         return Unit.Value;
    //     }
    // }
    internal sealed class Handler(IValidator<Request> validator) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            return Unit.Value;
        }
    }
}

public class UpdateNotificationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPatch("/{id}",
        async (HttpContext context, Guid id, JsonElement jsonElement, ISender sender) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateNotification.Request(id, patch);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}