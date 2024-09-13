namespace Presentation.Contacts;

public static class SearchContactsWithFriendStatus
{
    public record Request(string name) : IRequest<IEnumerable<Contact>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<Contact>>
    {
        private readonly IContactRepository _contactRepository;

        public Handler(IUnitOfWork uow)
        {
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<IEnumerable<Contact>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await _contactRepository.SearchContactsWithFriendStatus(request.name);
        }
    }
}

public class SearchContactsWithFriendStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("",
        async (ISender sender, string name) =>
        {
            var query = new SearchContactsWithFriendStatus.Request(name);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}