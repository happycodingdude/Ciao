namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationHandle(IHttpContextAccessor httpContextAccessor, IIdentityService identityService) : AuthorizationHandler<BasicAuthenticationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        try
        {
            var user = await identityService.FindByNameAsync(httpContextAccessor.HttpContext.User.Identity.Name);
            httpContextAccessor.HttpContext.Session.SetString("UserId", user.Id);

            context.Succeed(requirement);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw new UnauthorizedException();
        }
    }
}