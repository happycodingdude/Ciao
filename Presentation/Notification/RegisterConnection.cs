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
        readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly IDistributedCache _distributedCache;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache,
            IService<IContactRepository> service)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _distributedCache = distributedCache;
            _contactRepository = service.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = await _contactRepository.GetInfoAsync();
            await _distributedCache.SetStringAsync($"connection-{user.Id}", request.token);

            return Unit.Value;
        }
    }
}

public class RegisterConnectionEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Notification).MapGet("/register",
        async (ISender sender, string token) =>
        {
            var query = new RegisterConnection.Request(token);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}