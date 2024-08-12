namespace Presentation.Identities;

public static class ForgotPassword
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler(UserManager<AuthenticationUser> userManager) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByNameAsync(request.model.Username);
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, token, request.model.Password);

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