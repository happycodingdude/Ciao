namespace Infrastructure.Middleware.Authentication;

public class BasicAuthenticationHandle : AuthorizationHandler<BasicAuthenticationRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IHttpClientFactory _clientFactory;

    public BasicAuthenticationHandle(IHttpContextAccessor httpContextAccessor, IHttpClientFactory clientFactory)
    {
        _httpContextAccessor = httpContextAccessor;
        _clientFactory = clientFactory;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, BasicAuthenticationRequirement requirement)
    {
        try
        {
            var authorization = _httpContextAccessor.HttpContext.Request.Headers.Authorization;
            var token = authorization.ToString().Split(' ')[1];
            var client = _clientFactory.CreateClient(AppConstants.HttpClient_Auth);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.GetAsync(AppConstants.ApiRoute_User + AppConstants.ApiEndpoint_Token);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var user = JsonConvert.DeserializeObject<AppUser>(content);
            _httpContextAccessor.HttpContext.Session.SetString("UserId", user.id);

            context.Succeed(requirement);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            throw new UnauthorizedException();
        }
    }
}