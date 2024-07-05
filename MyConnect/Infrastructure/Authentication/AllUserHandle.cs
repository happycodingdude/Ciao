namespace Infrastructure.Authentication;

public class AllUserHandle : AuthorizationHandler<AllUserRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IHttpClientFactory _clientFactory;

    public AllUserHandle(IHttpContextAccessor httpContextAccessor, IHttpClientFactory clientFactory)
    {
        _httpContextAccessor = httpContextAccessor;
        _clientFactory = clientFactory;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AllUserRequirement requirement)
    {
        try
        {
            var authorization = _httpContextAccessor.HttpContext.Request.Headers.Authorization;
            var token = authorization.ToString().Split(' ')[1];
            var client = _clientFactory.CreateClient(AppConstants.HttpClient_Auth);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.GetAsync(AppConstants.ApiRoute_User + AppConstants.ApiEndpoint_Token);

            // Console.WriteLine(response.IsSuccessStatusCode);

            response.EnsureSuccessStatusCode();

            // Console.WriteLine("Authenticate successfully");
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