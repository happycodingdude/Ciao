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
        private readonly IValidator<Request> _validator;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDistributedCache _distributedCache;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _distributedCache = distributedCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();
            await _distributedCache.SetStringAsync($"connection-{userId}", request.token);

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