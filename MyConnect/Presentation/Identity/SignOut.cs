namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly UserManager<AuthenticationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDistributedCache _distributedCache;
        private readonly IUnitOfWork _uow;
        private readonly IContactRepository _contactRepository;

        public Handler(UserManager<AuthenticationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache,
            IUnitOfWork uow)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _distributedCache = distributedCache;
            _uow = uow;
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Delete all cookies
            foreach (var cookie in _httpContextAccessor.HttpContext.Request.Cookies.Keys)
                _httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie);

            var user = await _userManager.FindByNameAsync(_httpContextAccessor.HttpContext.User.Identity.Name);
            // Delete Firebase connection
            await _distributedCache.RemoveAsync($"connection-{user.Id}");

            // Update IsOnline false
            // _ = _contactRepository.TrackChangeAsync(CollectionChange, cancellationToken);
            var filter = MongoQuery<Contact>.EmptyFilter();
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false)
                .Set(q => q.LastLogout, DateTime.Now);
            _contactRepository.Update(filter, updates);

            return Unit.Value;
        }

        async Task CollectionChange(ChangeStreamDocument<Contact> change)
        {
            Contact changed = change.FullDocument;
            Console.WriteLine($"changed => {changed.Id}");
            // Cập nhật lại collection All để làm search
            var repo = _uow.GetService<IContactRepository>();
            repo.UseDatabase(typeof(Contact).Name, "All");
            var filter = MongoQuery<Contact>.IdFilter(changed.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false);
            repo.Update(filter, updates);
            await _uow.SaveAsync();
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