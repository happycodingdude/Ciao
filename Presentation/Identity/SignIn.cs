namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        // readonly SignInManager<AuthenticationUser> _signInManager;
        // readonly UserManager<AuthenticationUser> _userManager;
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Handler(
            // SignInManager<AuthenticationUser> signInManager,
            // UserManager<AuthenticationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            IService<IContactRepository> contactService,
            IService<IConversationRepository> conversationService)
        {
            // _signInManager = signInManager;
            // _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _contactRepository = contactService.Get();
            _conversationRepository = conversationService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetByUsername(request.model.Username);
            if (user is null) throw new UnauthorizedException();

            var verified = _passwordHasher.VerifyHashedPassword(request.model.Username, user.Password, request.model.Password);
            if (verified == PasswordVerificationResult.Failed) throw new UnauthorizedException();

            // Update IsOnline true
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            if (!user.IsOnline)
            {
                var updates = Builders<Contact>.Update.Set(q => q.IsOnline, true);
                _contactRepository.Update(filter, updates);
            }

            // Update contact infor in conversation
            var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
            var conversationUpdates = Builders<Conversation>.Update
                .Set("Participants.$[elem].Contact.IsOnline", true);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.Contact._id", user.Id)
                );
            _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            // Signin
            var claims = new List<Claim>
            {
                new Claim("UserId", user.Id)
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            var properties = new AuthenticationProperties
            {
                IsPersistent = true, // for 'remember me' feature                          
            };
            await _httpContextAccessor.HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                properties
            );

            return Unit.Value;
        }

        // public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        // {
        //     // Stream originalBodyStream = httpContextAccessor.HttpContext.Response.Body;
        //     using (var ms = new MemoryStream())
        //     {
        //         _httpContextAccessor.HttpContext.Response.Body = ms;

        //         _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        //         await _signInManager.PasswordSignInAsync(request.model.Username, request.model.Password, false, lockoutOnFailure: false);

        //         ms.Seek(0, SeekOrigin.Begin);
        //         var responseBody = new StreamReader(ms).ReadToEnd();
        //         if (string.IsNullOrEmpty(responseBody))
        //             throw new UnauthorizedException();

        //         var responseModel = JsonConvert.DeserializeObject<SignInResponse>(responseBody);
        //         _httpContextAccessor.HttpContext.Response.Headers.Append("access_token", responseModel.accessToken);
        //         _httpContextAccessor.HttpContext.Response.Headers.Append("refresh_token", responseModel.refreshToken);

        //         // ms.Seek(0, SeekOrigin.Begin);
        //         // await ms.CopyToAsync(originalBodyStream);

        //         // Another way
        //         // context.Response.Body = originalBodyStream;
        //         // await context.Response.Body.WriteAsync(ms.ToArray());

        //         // Update IsOnline true
        //         var user = await _userManager.FindByNameAsync(request.model.Username);
        //         // _contactRepository.UseDatabase(user.Id);
        //         // var filter = MongoQuery<Contact>.EmptyFilter();
        //         var filter = Builders<Contact>.Filter.Where(q => q.UserId == user.Id);
        //         var contact = await _contactRepository.GetItemAsync(filter);
        //         if (!contact.IsOnline)
        //         {
        //             var updates = Builders<Contact>.Update
        //                 .Set(q => q.IsOnline, true);
        //             _contactRepository.Update(filter, updates);
        //         }
        //     }

        //     return Unit.Value;
        // }
    }
}

public class SignInEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapPost("/signin",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new SignIn.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}