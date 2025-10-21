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
        // readonly IHubContext<SignalHub> _hubContext;
        // readonly ILogger _logger;

        public Handler(IContactRepository contactRepository, UserCache userCache, ConversationCache conversationCache, FriendCache friendCache)
        {
            _contactRepository = contactRepository;
            _userCache = userCache;
            _conversationCache = conversationCache;
            _friendCache = friendCache;
            // _hubContext = hubContext;
            // _logger = logger;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();

            // Update contact info
            var filter = Builders<Contact>.Filter.Where(q => q.Id == userId);
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false)
                .Set(q => q.LastLogout, DateTime.Now)
                .Set(q => q.RefreshToken, null)
                .Set(q => q.ExpiryDate, null);
            _contactRepository.Update(filter, updates);

            // Remove from group for broadcasting
            // var connection = await _userCache.GetUserConnection(userId);
            // var conversationIds = await _conversationCache.GetListConversationId(userId);
            // foreach (var conversationId in conversationIds)
            // {
            //     _logger.Debug($"Remove user {userId} from group {conversationId}");
            //     await _hubContext.Groups.RemoveFromGroupAsync(connection, conversationId);
            // }

            // Remove all cache
            _userCache.RemoveAll();
            // await _memberCache.MemberSignout();
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