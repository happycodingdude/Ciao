namespace Presentation.Contacts;

public static class PresencePing
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IContactRepository _contactRepository;
        readonly IPresenceService _presenceService;

        public Handler(IContactRepository contactRepository, IPresenceService presenceService)
        {
            _contactRepository = contactRepository;
            _presenceService = presenceService;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            await _presenceService.UpdateActivityAsync(userId);
            return Unit.Value;
        }
    }
}

public class PresencePingEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Presence).MapGet("/ping",
        async (ISender sender) =>
        {
            var query = new PresencePing.Request();
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}