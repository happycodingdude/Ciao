namespace Presentation.Identities;

public static class RefreshToken
{
    public record Request(RefreshTokenRequest model) : IRequest<TokenModel>;

    internal sealed class Handler : IRequestHandler<Request, TokenModel>
    {
        readonly IContactRepository _contactRepository;
        readonly IJwtService _jwtService;
        readonly UserCache _userCache;

        public Handler(IContactRepository contactRepository, IJwtService jwtService, UserCache userCache)
        {
            _contactRepository = contactRepository;
            _jwtService = jwtService;
            _userCache = userCache;
        }

        public async Task<TokenModel> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.model.UserId));

            if (user is null || !user.IsOnline || user.RefreshToken != request.model.RefreshToken)
                throw new UnauthorizedException();

            if (user.ExpiryDate is null || user.ExpiryDate < DateTime.UtcNow)
                throw new UnauthorizedException();

            var token = _jwtService.GenerateToken(user.Id);
            var (refreshToken, expiryDate) = _jwtService.GenerateRefreshToken();

            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.RefreshToken, refreshToken)
                .Set(q => q.ExpiryDate, expiryDate);
            _contactRepository.Update(filter, updates);

            await _userCache.SetTokenAsync(user.Id, token);

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
