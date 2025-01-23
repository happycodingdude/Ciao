namespace Presentation.Identities;

public static class SignOut
{
    public record Request() : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly UserCache _userCache;
        readonly ConversationCache _conversationCache;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Handler(UserCache userCache, ConversationCache conversationCache, IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _userCache = userCache;
            _conversationCache = conversationCache;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();

            // Update contact info
            var filter = Builders<Contact>.Filter.Where(q => q.Id == user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.IsOnline, false)
                .Set(q => q.LastLogout, DateTime.Now)
                .Set(q => q.RefreshToken, null)
                .Set(q => q.ExpiryDate, null);
            _contactRepository.Update(filter, updates);

            // Update contact info in conversation
            var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
            var conversationUpdates = Builders<Conversation>.Update
                .Set("Participants.$[elem].Contact.IsOnline", false);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.Contact._id", user.Id)
                );
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            // Remove all cache
            _userCache.RemoveAll();
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