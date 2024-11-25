namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        // readonly UserManager<AuthenticationUser> _userManager;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly IDistributedCache _distributedCache;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Handler(
            // UserManager<AuthenticationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            IDistributedCache distributedCache,
            IService<IContactRepository> contactService,
            IService<IConversationRepository> conversationService)
        {
            // _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _distributedCache = distributedCache;
            _contactRepository = contactService.Get();
            _conversationRepository = conversationService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // // Delete all cookies
            // foreach (var cookie in _httpContextAccessor.HttpContext.Request.Cookies.Keys)
            //     _httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie);

            // var identity = await _userManager.FindByNameAsync(_httpContextAccessor.HttpContext.User.Identity.Name);
            var user = await _contactRepository.GetInfoAsync();

            // Delete Firebase connection
            await _distributedCache.RemoveAsync($"connection-{user.Id}");

            // Update IsOnline false
            var filter = Builders<Contact>.Filter.Where(q => q.Id == user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false)
                .Set(q => q.LastLogout, DateTime.Now);
            _contactRepository.Update(filter, updates);

            // Update contact infor in conversation
            var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
            var conversationUpdates = Builders<Conversation>.Update
                .Set("Participants.$[elem].Contact.IsOnline", false);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.Contact._id", user.Id)
                );
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            await _httpContextAccessor.HttpContext.SignOutAsync();

            return Unit.Value;
        }
    }
}

public class SignOutEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapGet("/signout",
        async (ISender sender) =>
        {
            var request = new SignOut.Request();
            await sender.Send(request);
            return Results.Ok();
        }).RequireAuthorization();
    }
}