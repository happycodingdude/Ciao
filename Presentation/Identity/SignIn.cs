namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<TokenModel>;

    internal sealed class Handler : IRequestHandler<Request, TokenModel>
    {
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IContactRepository _contactRepository;
        readonly IJwtService _jwtService;
        readonly UserCache _userCache;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IContactRepository contactRepository, IJwtService jwtService, UserCache userCache, IKafkaProducer kafkaProducer)
        {
            _contactRepository = contactRepository;
            _jwtService = jwtService;
            _userCache = userCache;
            _kafkaProducer = kafkaProducer;
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

                // Update contact info
                var filter = MongoQuery<Contact>.IdFilter(user.Id);
                var updates = Builders<Contact>.Update
                    .Set(q => q.IsOnline, true)
                    .Set(q => q.RefreshToken, refreshToken)
                    .Set(q => q.ExpiryDate, expiryDate);
                _contactRepository.Update(filter, updates);

                await _kafkaProducer.ProduceAsync(Topic.UserLogin, new UserLoginModel
                {
                    UserId = user.Id,
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiryDate = expiryDate
                });
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