namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<TokenModel>;

    internal sealed class Handler : IRequestHandler<Request, TokenModel>
    {
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IJwtService _jwtService;
        readonly IDistributedCache _distributedCache;
        readonly IHttpContextAccessor _httpContextAccessor;

        public Handler(IService<IContactRepository> contactService,
            IService<IConversationRepository> conversationService,
            IJwtService jwtService,
            IDistributedCache distributedCache,
            IHttpContextAccessor httpContextAccessor)
        {
            _contactRepository = contactService.Get();
            _conversationRepository = conversationService.Get();
            _jwtService = jwtService;
            _distributedCache = distributedCache;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<TokenModel> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetByUsername(request.model.Username);
            if (user is null) throw new UnauthorizedException();

            var verified = _passwordHasher.VerifyHashedPassword(request.model.Username, user.Password, request.model.Password);
            if (verified == PasswordVerificationResult.Failed) throw new UnauthorizedException();

            var token = "";
            var refreshToken = "";

            // When signed out
            if (!user.IsOnline)
            {
                // Generate token and refresh token
                token = _jwtService.GenerateToken(user.Id);
                var (generatedRrefreshToken, expiryDate) = _jwtService.GenerateRefreshToken();
                refreshToken = generatedRrefreshToken;

                // Store to redis
                await _distributedCache.SetStringAsync($"token-{user.Id}", token);

                // Update contact info
                var filter = MongoQuery<Contact>.IdFilter(user.Id);
                var updates = Builders<Contact>.Update
                    .Set(q => q.IsOnline, true)
                    .Set(q => q.RefreshToken, refreshToken)
                    .Set(q => q.ExpiryDate, expiryDate);
                _contactRepository.Update(filter, updates);

                // Update contact info in conversation
                var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
                var conversationUpdates = Builders<Conversation>.Update
                    .Set("Participants.$[elem].Contact.IsOnline", true);
                var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                    new BsonDocument("elem.Contact._id", user.Id)
                    );
                _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);
            }
            else
            {
                token = await _distributedCache.GetStringAsync($"token-{user.Id}");
                refreshToken = user.RefreshToken;
            }


            _httpContextAccessor.HttpContext.Items["UserId"] = user.Id;
            var conversations = await _conversationRepository.GetConversationsWithUnseenMesages(new PagingParam(1, 100));
            await _distributedCache.SetStringAsync($"conversations-{user.Id}", JsonConvert.SerializeObject(conversations));

            return new TokenModel(token, refreshToken, user.Id);
        }
    }
}

public class SignInEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Identity).MapPost("/signin",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new SignIn.Request(model);
            var response = await sender.Send(request);
            return Results.Ok(response);
        });
    }
}