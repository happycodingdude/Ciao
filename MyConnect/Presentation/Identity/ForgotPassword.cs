namespace Presentation.Identities;

public static class ForgotPassword
{
    public record Request(IdentityRequest Model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IUnitOfWork uow)
        {
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly UserManager<AuthenticationUser> _userManager;

        public Handler(IValidator<Request> validator, UserManager<AuthenticationUser> userManager)
        {
            _validator = validator;
            _userManager = userManager;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByNameAsync(request.Model.Username);
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.Model.Password);

            return Unit.Value;
        }
    }
}

public class ForgotPasswordEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapPost("/forgot",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new ForgotPassword.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}