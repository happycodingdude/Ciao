namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<TokenModel>;

    internal sealed class Handler : IRequestHandler<Request, TokenModel>
    {
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IFriendRepository _friendRepository;
        readonly IJwtService _jwtService;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly UserCache _userCache;
        readonly ConversationCache _conversationCache;
        readonly FriendCache _friendCache;

        public Handler(IContactRepository contactRepository,
            IConversationRepository conversationRepository,
            IFriendRepository friendRepository,
            IJwtService jwtService,
            IHttpContextAccessor httpContextAccessor,
            UserCache userCache,
            ConversationCache conversationCache,
            FriendCache friendCache)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _friendRepository = friendRepository;
            _jwtService = jwtService;
            _httpContextAccessor = httpContextAccessor;
            _userCache = userCache;
            _conversationCache = conversationCache;
            _friendCache = friendCache;
        }

        public async Task<TokenModel> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetByUsername(request.model.Username);
            if (user is null) throw new UnauthorizedException();

            var verified = _passwordHasher.VerifyHashedPassword(request.model.Username, user.Password, request.model.Password);
            if (verified == PasswordVerificationResult.Failed) throw new UnauthorizedException();

            var token = "";
            var refreshToken = "";

            // _httpContextAccessor.HttpContext.Items["UserId"] = user.Id;
            // var friends = await _friendRepository.GetFriendItems();
            // Console.WriteLine(JsonConvert.SerializeObject(friends));

            // When signed out
            if (!user.IsOnline)
            {
                // Generate token and refresh token
                token = _jwtService.GenerateToken(user.Id);
                var (generatedRrefreshToken, expiryDate) = _jwtService.GenerateRefreshToken();
                refreshToken = generatedRrefreshToken;

                // Update contact info
                var filter = MongoQuery<Contact>.IdFilter(user.Id);
                var updates = Builders<Contact>.Update
                    .Set(q => q.IsOnline, true)
                    .Set(q => q.RefreshToken, refreshToken)
                    .Set(q => q.ExpiryDate, expiryDate);
                _contactRepository.Update(filter, updates);

                // Update cache
                _httpContextAccessor.HttpContext.Items["UserId"] = user.Id;

                var taskToComplete = new List<Task>(3)
                {
                    Task.Run(() =>
                    {
                        _userCache.SetToken(user.Id, token);
                        _userCache.SetInfo(user);
                    }),
                    Task.Run(async () =>
                    {
                        var conversations = await _conversationRepository.GetConversationsWithUnseenMesages(new PagingParam(1, 100));
                        conversations.ToList().ForEach(q =>
                        {
                            q.Members.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.IsOnline = true;
                        });
                        await _conversationCache.SetConversations(user.Id, conversations.ToList());
                    }),
                    Task.Run(async () =>
                    {
                        var friends = await _friendRepository.GetFriendItems();
                        await _friendCache.SetFriends(user.Id, friends);
                    })
                };
                await Task.WhenAll(taskToComplete);
            }
            else
            {
                token = _userCache.GetToken(user.Id);
                refreshToken = user.RefreshToken;
            }

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