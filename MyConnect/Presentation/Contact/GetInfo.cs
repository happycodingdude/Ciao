namespace Presentation.Contacts;

public static class GetInfo
{
    public record Request(Guid id) : IRequest<ContactDto>;

    internal sealed class Handler(IContactService service) : IRequestHandler<Request, ContactDto>
    {
        public async Task<ContactDto> Handle(Request request, CancellationToken cancellationToken)
        {
            return await service.GetByIdAsync(request.id);
        }
    }
}

public class GetInfoEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/info",
        async (HttpContext context, ISender sender) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetInfo.Request(userId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}