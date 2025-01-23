namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request() : IRequest<Contact>;

    internal sealed class Handler : IRequestHandler<Request, Contact>
    {
        readonly UserCache _userCache;

        public Handler(UserCache userCache)
        {
            _userCache = userCache;
        }

        public async Task<Contact> Handle(Request request, CancellationToken cancellationToken)
        {
            return _userCache.GetInfo();
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