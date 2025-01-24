namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly UserCache _userCache;
        readonly ConversationCache _conversationCache;
        readonly MemberCache _memberCache;

        public Handler(IContactRepository contactRepository, IConversationRepository conversationRepository, UserCache userCache, ConversationCache conversationCache, MemberCache memberCache)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _userCache = userCache;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
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

            // Update contact info in conversation
            var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", userId);
            var conversationUpdates = Builders<Conversation>.Update
                .Set("Participants.$[elem].Contact.IsOnline", false);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.Contact._id", userId)
                );
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            // Remove all cache
            _userCache.RemoveAll();
            var conversations = await _conversationCache.GetConversations();
            await _memberCache.MemberSignout(conversations.Select(q => q.Id).ToList(), userId);
            _conversationCache.RemoveAll();

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