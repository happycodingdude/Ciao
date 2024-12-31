using Newtonsoft.Json;

namespace Presentation.Identities;

public static class RefreshToken
{
    public record Request(RefreshTokenRequest model) : IRequest<TokenModel>;

    internal sealed class Handler : IRequestHandler<Request, TokenModel>
    {
        readonly IContactRepository _contactRepository;
        readonly IJwtService _jwtService;
        readonly IDistributedCache _distributedCache;

        public Handler(IService<IContactRepository> contactService,
            IJwtService jwtService,
            IDistributedCache distributedCache)
        {
            _contactRepository = contactService.Get();
            _jwtService = jwtService;
            _distributedCache = distributedCache;
        }

        public async Task<TokenModel> Handle(Request request, CancellationToken cancellationToken)
        {
            // Check user id and refresh token valid
            var user = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.model.UserId));
            var invalidUser = user is null;
            var wrongRefreshToken = user?.RefreshToken != request.model.RefreshToken;
            var userSignedOut = user?.IsOnline == false;
            if (invalidUser || wrongRefreshToken || userSignedOut)
                throw new UnauthorizedException();

            // Generate token and refresh token
            var token = _jwtService.GenerateToken(user.Id);
            var (refreshToken, expiryDate) = _jwtService.GenerateRefreshToken();

            // Store to redis
            await _distributedCache.SetStringAsync($"token-{user.Id}", token);

            // Update contact info
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.RefreshToken, refreshToken)
                .Set(q => q.ExpiryDate, expiryDate);
            _contactRepository.Update(filter, updates);

            return new TokenModel(token, refreshToken, user.Id);
        }
    }
}

public class RefreshTokenEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Identity).MapPost("/refresh",
        async (ISender sender, RefreshTokenRequest model) =>
        {
            var request = new RefreshToken.Request(model);
            var response = await sender.Send(request);
            return Results.Ok(response);
        });
    }
}