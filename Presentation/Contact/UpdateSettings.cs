namespace Presentation.Contacts;

public static class UpdateSettings
{
    public record Request(ContactSettings model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IContactRepository _contactRepository;
        readonly UserCache _userCache;

        public Handler(IContactRepository contactRepository, UserCache userCache)
        {
            _contactRepository = contactRepository;
            _userCache = userCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();
            if (user is null)
                throw new BadRequestException("User not found");

            // Update bị DEFER vào UnitOfWork → commit ở GlobalTransactionMiddleware sau handler.
            // Mọi thao tác sau đây PHẢI null-safe, không throw.
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update.Set(q => q.Settings, request.model);
            _contactRepository.Update(filter, updates);

            // Sync user-info cache: privacy mask (IsOnlineVisibleAsync) đọc Settings từ chính cache này.
            user.Settings = request.model;
            await _userCache.SetInfoAsync(user);

            return Unit.Value;
        }
    }
}

public class UpdateSettingsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPut("/settings",
        async (ISender sender, ContactSettings model) =>
        {
            await sender.Send(new UpdateSettings.Request(model));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
