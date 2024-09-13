namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request() : IRequest<Contact>;

    internal sealed class Handler : IRequestHandler<Request, Contact>
    {
        private readonly IContactRepository _contactRepository;

        public Handler(IUnitOfWork uow)
        {
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<Contact> Handle(Request request, CancellationToken cancellationToken)
        {
            return (await _contactRepository.GetAllAsync(MongoQuery<Contact>.EmptyFilter())).SingleOrDefault();
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