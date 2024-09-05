namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request() : IRequest<Contact>;

    internal sealed class Handler(IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : IRequestHandler<Request, Contact>
    {
        public async Task<Contact> Handle(Request request, CancellationToken cancellationToken)
        {
            return (await uow.Contact.GetAllAsync(Builders<Contact>.Filter.Empty)).SingleOrDefault();
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