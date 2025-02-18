namespace Presentation.Notifications;

public static class SeenAllNotification
{
    public record Request() : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        internal sealed class Handler : IRequestHandler<Request, Unit>
        {
            readonly INotificationRepository _notificationRepository;
            readonly IContactRepository _contactRepository;

            public Handler(INotificationRepository notificationRepository, IContactRepository contactRepository)
            {
                _notificationRepository = notificationRepository;
                _contactRepository = contactRepository;
            }

            public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
            {
                var user = await _contactRepository.GetInfoAsync();
                var filter = Builders<Notification>.Filter.Where(q => q.ContactId == user.Id && !q.Read);
                var notification = await _notificationRepository.GetAllAsync(filter);
                if (!notification.Any()) return Unit.Value;

                var updates = Builders<Notification>.Update.Set(q => q.Read, true);
                _notificationRepository.Update(filter, updates);

                return Unit.Value;
            }
        }
    }

    public class SeenAllNotificationEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGroup(AppConstants.ApiGroup_Notification).MapPut("",
            async (ISender sender) =>
            {
                var query = new SeenAllNotification.Request();
                await sender.Send(query);
                return Results.Ok();
            }).RequireAuthorization();
        }
    }
}