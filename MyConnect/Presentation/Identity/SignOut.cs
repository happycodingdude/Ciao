namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler(UserManager<AuthenticationUser> userManager,
        IHttpContextAccessor httpContextAccessor,
        IDistributedCache distributedCache) : IRequestHandler<Request, Unit>
    {
        readonly ClaimsPrincipal _claimPrincipal;

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Delete all cookies
            foreach (var cookie in httpContextAccessor.HttpContext.Request.Cookies.Keys)
                httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie);

            var user = await userManager.FindByNameAsync(_claimPrincipal.Identity.Name);

            // Delete Firebase connection
            await distributedCache.RemoveAsync($"connection-{user.Id}");

            return Unit.Value;
        }
    }
}

public class SignOutEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapGet("/signout",
        async (ISender sender, HttpContext _httpContext, ClaimsPrincipal claimPrincipal) =>
        {
            var request = new SignOut.Request();
            await sender.Send(request);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}