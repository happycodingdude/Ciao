namespace Presentation.Notifications;

public static class SeenNotification
{
    public record Request(string id) : IRequest<Unit>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            Expression<Func<Notification, bool>> filter = q => q.Id == request.id;
            var entity = await uow.Notification.GetItemAsync(filter);
            if (entity.Read) return Unit.Value;

            entity.Read = true;
            await uow.Notification.UpdateAsync(filter, entity);

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