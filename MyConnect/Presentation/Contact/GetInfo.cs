namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request() : IRequest<Contact>;

    internal sealed class Handler : IRequestHandler<Request, Contact>
    {
        readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IContactRepository _contactRepository;

        public Handler(IHttpContextAccessor httpContextAccessor, IUnitOfWork uow)
        {
            _contactRepository = uow.GetService<IContactRepository>();
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Contact> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext.Items["UserId"].ToString();
            var filter = Builders<Contact>.Filter.Where(q => q.UserId == userId);
            return await _contactRepository.GetItemAsync(filter);
        }
    }
}

public class GetInfoEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/info",
        async (ISender sender) =>
        {
            var query = new GetInfo.Request();
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}