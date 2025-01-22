namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationRequirement : IAuthorizationRequirement
{
    public BasicAuthenticationRequirement() { }
}

public class BasicAuthenticationHandle(IHttpContextAccessor httpContextAccessor, IJwtService jwtService, IDistributedCache distributedCache) : AuthorizationHandler<BasicAuthenticationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        Console.WriteLine("BasicAuthenticationHandle calling");
        try
        {
            // Retrieve token from Authorization header
            var httpContext = (context.Resource as DefaultHttpContext)!;
            var token = httpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("Token empty");
                throw new UnauthorizedException();
            }

            var validated = jwtService.ValidateToken(token, out var principal);
            if (!validated)
                throw new UnauthorizedException();

            var userId = principal?.FindFirst("UserId")?.Value;
            var storedToken = await distributedCache.GetStringAsync($"token-{userId}");
            if (token != storedToken)
                throw new UnauthorizedException();

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