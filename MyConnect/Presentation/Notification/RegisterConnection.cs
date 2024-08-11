namespace Presentation.Notifications;

public static class RegisterConnection
{
    public class Query : IRequest<Unit>
    {
        public Guid ContactId { get; set; }
        public string Token { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Token).NotEmpty().WithMessage("Token should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        readonly IValidator<Query> _validator;
        readonly IDistributedCache _distributedCache;

        public Handler(IValidator<Query> validator, IDistributedCache distributedCache)
        {
            _validator = validator;
            _distributedCache = distributedCache;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _distributedCache.SetStringAsync($"connection-{request.ContactId}", request.Token);
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
            var query = new RegisterConnection.Query
            {
                ContactId = userId,
                Token = token
            };
            var response = await sender.Send(query);
            return Results.Ok(response);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}