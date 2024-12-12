namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationRequirement : IAuthorizationRequirement
{
    public BasicAuthenticationRequirement() { }
}

public class BasicAuthenticationHandle(IHttpContextAccessor httpContextAccessor) : AuthorizationHandler<BasicAuthenticationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        Console.WriteLine("BasicAuthenticationHandle calling");
        try
        {
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