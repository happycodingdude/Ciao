namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request() : IRequest<Contact>;

    internal sealed class Handler : IRequestHandler<Request, Contact>
    {
        readonly IContactRepository _contactRepository;
        readonly IDistributedCache _distributedCache;

        public Handler(IContactRepository contactRepository, IDistributedCache distributedCache)
        {
            _contactRepository = contactRepository;
            _distributedCache = distributedCache;
        }

        public async Task<Contact> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var cachedData = await _distributedCache.GetStringAsync($"info-{userId}");
            return JsonConvert.DeserializeObject<Contact>(cachedData);
        }
    }
}

public class GetInfoEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapGet("/info",
        async (ISender sender) =>
        {
            var query = new GetInfo.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}