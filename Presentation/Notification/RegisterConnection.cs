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
        readonly UserCache _userCache;

        public Handler(IValidator<Request> validator, UserCache userCache)
        {
            _validator = validator;
            _userCache = userCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _userCache.SetUserConnection(request.token);

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
        }).RequireAuthorization();
    }
}