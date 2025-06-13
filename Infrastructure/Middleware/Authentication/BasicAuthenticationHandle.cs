namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationRequirement : IAuthorizationRequirement
{
    public BasicAuthenticationRequirement() { }
}

public class BasicAuthenticationHandle(ILogger logger, IHttpContextAccessor httpContextAccessor, IJwtService jwtService, UserCache userCache) : AuthorizationHandler<BasicAuthenticationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        // _logger.Information("BasicAuthenticationHandle calling");
        try
        {
            // Retrieve token from Authorization header
            var httpContext = (context.Resource as DefaultHttpContext)!;
            var token = httpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                logger.Information("Token empty");
                throw new UnauthorizedException();
            }

            var validated = jwtService.ValidateToken(token, out var principal);
            if (!validated)
                throw new UnauthorizedException();

            var userId = principal?.FindFirst("UserId")?.Value;
            // Kiểm tra loại trừ token cũ còn hiệu lực
            var storedToken = await userCache.GetToken(userId);
            if (token != storedToken)
                throw new UnauthorizedException();

            httpContextAccessor.HttpContext.Items["UserId"] = userId;

            context.Succeed(requirement);
        }
        catch (Exception ex)
        {
            logger.Error(ex, "");
            throw new UnauthorizedException();
        }
    }
}