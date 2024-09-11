namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly UserManager<AuthenticationUser> userManager;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IDistributedCache distributedCache;
        private readonly IUnitOfWork uow;
        private readonly IContactRepository contactRepository;

        public Handler(UserManager<AuthenticationUser> userManager, IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache, IUnitOfWork uow, IServiceScopeFactory scopeFactory)
        {
            this.userManager = userManager;
            this.httpContextAccessor = httpContextAccessor;
            this.distributedCache = distributedCache;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                contactRepository = scope.ServiceProvider.GetService<IContactRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Delete all cookies
            foreach (var cookie in httpContextAccessor.HttpContext.Request.Cookies.Keys)
                httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie);

            var user = await userManager.FindByNameAsync(httpContextAccessor.HttpContext.User.Identity.Name);
            // Delete Firebase connection
            await distributedCache.RemoveAsync($"connection-{user.Id}");

            // Update IsOnline false
            var contact = (await contactRepository.GetAllAsync(Builders<Contact>.Filter.Empty)).SingleOrDefault();
            if (contact.IsOnline)
            {
                var updates = Builders<Contact>.Update
                    .Set(q => q.IsOnline, false);
                contactRepository.Update(Builders<Contact>.Filter.Empty, updates);
                await uow.SaveAsync();
            }

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