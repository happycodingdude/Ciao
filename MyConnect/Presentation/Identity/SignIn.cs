namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler(SignInManager<AuthenticationUser> signInManager, IHttpContextAccessor httpContextAccessor) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Stream originalBodyStream = httpContextAccessor.HttpContext.Response.Body;
            using (var ms = new MemoryStream())
            {
                httpContextAccessor.HttpContext.Response.Body = ms;

                signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
                await signInManager.PasswordSignInAsync(request.model.Username, request.model.Password, false, lockoutOnFailure: false);

                ms.Seek(0, SeekOrigin.Begin);
                var responseBody = new StreamReader(ms).ReadToEnd();
                if (string.IsNullOrEmpty(responseBody))
                    throw new UnauthorizedException();

                var responseModel = JsonConvert.DeserializeObject<SignInResponse>(responseBody);
                httpContextAccessor.HttpContext.Response.Headers.Append("access_token", responseModel.accessToken);
                httpContextAccessor.HttpContext.Response.Headers.Append("refresh_token", responseModel.refreshToken);

                // ms.Seek(0, SeekOrigin.Begin);
                // await ms.CopyToAsync(originalBodyStream);

                // Another way
                // context.Response.Body = originalBodyStream;
                // await context.Response.Body.WriteAsync(ms.ToArray());
            }

            return Unit.Value;
        }
    }
}

public class SignInEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapPost("/signin",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new SignIn.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}