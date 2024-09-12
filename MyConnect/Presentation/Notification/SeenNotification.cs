namespace Presentation.Notifications;

public static class SeenNotification
{
    public record Request(string id) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly INotificationRepository _notificationRepository;

        public Handler(IUnitOfWork uow)
        {
            _notificationRepository = uow.GetService<INotificationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery.IdFilter<Notification>(request.id);
            var entity = await _notificationRepository.GetItemAsync(filter);
            if (entity.Read) return Unit.Value;

            var updates = Builders<Notification>.Update
                .Set(q => q.Read, true);
            _notificationRepository.Update(filter, updates);

            return Unit.Value;
        }
    }
}

public class SeenNotificationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPut("/{id}",
        async (string id, ISender sender) =>
        {
            var query = new SeenNotification.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}