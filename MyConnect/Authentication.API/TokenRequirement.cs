namespace Authentication.API;

public class TokenRequirement : IAuthorizationRequirement
{

}

public class TokenHandler : AuthorizationHandler<TokenRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<AppUser> _manager;

    public TokenHandler(IHttpContextAccessor httpContextAccessor, UserManager<AppUser> manager)
    {
        _httpContextAccessor = httpContextAccessor;
        _manager = manager;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, TokenRequirement requirement)
    {
        try
        {
            var cookies = _httpContextAccessor.HttpContext.Request.Cookies;
            var token = cookies["token"];
            Console.WriteLine("token: " + token);

            context.Succeed(requirement);

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw new UnauthorizedException();
        }
    }
}