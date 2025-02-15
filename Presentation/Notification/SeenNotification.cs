namespace Presentation.Notifications;

public static class SeenNotification
{
    public record Request(string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly INotificationRepository _notificationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _notificationRepository = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            }
            RuleFor(c => c.id).ContactRelatedToNotification(_contactRepository, _notificationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly INotificationRepository _notificationRepository;

        public Handler(IValidator<Request> validator, INotificationRepository notificationRepository)
        {
            _validator = validator;
            _notificationRepository = notificationRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Notification>.IdFilter(request.id);
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
        app.MapGroup(AppConstants.ApiGroup_Notification).MapPut("/{id}",
        async (string id, ISender sender) =>
        {
            var query = new SeenNotification.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}