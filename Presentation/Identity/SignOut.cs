namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IContactRepository _contactRepository;
        readonly UserCache _userCache;
        readonly ConversationCache _conversationCache;
        readonly FriendCache _friendCache;

        public Handler(IContactRepository contactRepository, UserCache userCache, ConversationCache conversationCache, FriendCache friendCache)
        {
            _contactRepository = contactRepository;
            _userCache = userCache;
            _conversationCache = conversationCache;
            _friendCache = friendCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();

            var filter = Builders<Contact>.Filter.Where(q => q.Id == userId);
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false)
                .Set(q => q.LastLogout, DateTime.UtcNow)
                .Set(q => q.RefreshToken, null)
                .Set(q => q.ExpiryDate, null);
            _contactRepository.Update(filter, updates);

            await _userCache.RemoveAllAsync();
            _conversationCache.RemoveAll();
            _friendCache.RemoveAll();

            return Unit.Value;
        }
    }
}

public class SignOutEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Identity).MapGet("/signout",
        async (ISender sender) =>
        {
            var request = new SignOut.Request();
            await sender.Send(request);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
