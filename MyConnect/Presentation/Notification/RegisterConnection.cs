namespace Presentation.Notifications;

public static class RegisterConnection
{
    public record Request(Guid contactId, string token) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.token).NotEmpty().WithMessage("Token should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IDistributedCache distributedCache) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await distributedCache.SetStringAsync($"connection-{request.contactId}", request.token);
            return Unit.Value;
        }
    }
}

public class RegisterConnectionEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPost("",
        async (HttpContext context, ISender sender, string token) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new RegisterConnection.Request(userId, token);
            var response = await sender.Send(query);
            return Results.Ok(response);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}