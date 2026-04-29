namespace Presentation.Identities;

public static class SignInWithCookie
{
    public record Request(SignInRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Handler(IHttpContextAccessor httpContextAccessor, IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _httpContextAccessor = httpContextAccessor;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetByUsername(request.model.Username);
            if (user is null) throw new UnauthorizedException();

            var verified = _passwordHasher.VerifyHashedPassword(request.model.Username, user.Password, request.model.Password);
            if (verified == PasswordVerificationResult.Failed) throw new UnauthorizedException();

            if (!user.IsOnline)
            {
                var filter = MongoQuery<Contact>.IdFilter(user.Id);
                var updates = Builders<Contact>.Update.Set(q => q.IsOnline, true);
                _contactRepository.Update(filter, updates);
            }

            var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
            var conversationUpdates = Builders<Conversation>.Update.Set("Participants.$[elem].Contact.IsOnline", true);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(new BsonDocument("elem.Contact._id", user.Id));
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            var claims = new List<Claim> { new Claim("UserId", user.Id) };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            var properties = new AuthenticationProperties { IsPersistent = true };

            await _httpContextAccessor.HttpContext!.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                properties
            );

            return Unit.Value;
        }
    }
}

public class SignInWithCookieEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Identity).MapPost("/signin-cookie",
        async (ISender sender, SignInRequest model) =>
        {
            var request = new SignInWithCookie.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}
