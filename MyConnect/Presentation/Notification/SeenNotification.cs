namespace Presentation.Notifications;

public static class SeenNotification
{
    public record Request(string id) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IUnitOfWork uow;
        private readonly INotificationRepository notificationRepository;

        public Handler(IServiceScopeFactory scopeFactory, IUnitOfWork uow)
        {
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                notificationRepository = scope.ServiceProvider.GetService<INotificationRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery.IdFilter<Notification>(request.id);
            var entity = await notificationRepository.GetItemAsync(filter);
            if (entity.Read) return Unit.Value;

            entity.Read = true;
            notificationRepository.UpdateOne(filter, entity);
            await uow.SaveAsync();

            return Unit.Value;
        }
    }
}

public class SeenNotificationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPatch("/{id}",
        async (string id, ISender sender) =>
        {
            var query = new SeenNotification.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}