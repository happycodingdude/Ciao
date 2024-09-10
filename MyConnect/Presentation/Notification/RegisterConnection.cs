namespace Presentation.Notifications;

public static class RegisterConnection
{
    public record Request(string token) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.token).NotEmpty().WithMessage("Token should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IDistributedCache distributedCache;

        public Handler(IValidator<Request> validator, IHttpContextAccessor httpContextAccessor, IDistributedCache distributedCache)
        {
            this.validator = validator;
            this.httpContextAccessor = httpContextAccessor;
            this.distributedCache = distributedCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");
            await distributedCache.SetStringAsync($"connection-{userId}", request.token);

            return Unit.Value;
        }
    }
}

public class RegisterConnectionEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPost("",
        async (ISender sender, string token) =>
        {
            var query = new RegisterConnection.Request(token);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}