namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationHandle(IHttpContextAccessor httpContextAccessor
// , IIdentityService identityService
) : AuthorizationHandler<BasicAuthenticationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        Console.WriteLine("BasicAuthenticationHandle calling");
        try
        {
            // var user = await identityService.FindByNameAsync(httpContextAccessor.HttpContext.User.Identity.Name);
            // httpContextAccessor.HttpContext.Items["UserId"] = user.Id;
            // httpContextAccessor.HttpContext.Items["UserId"] = "3a335999-551d-4d7b-8115-e015334bfc23";

            var userId = httpContextAccessor.HttpContext.User.Claims.SingleOrDefault(q => q.Type == "UserId").Value;
            httpContextAccessor.HttpContext.Items["UserId"] = userId;

            context.Succeed(requirement);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw new UnauthorizedException();
        }
    }
}