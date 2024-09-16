namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly SignInManager<AuthenticationUser> _signInManager;
        private readonly UserManager<AuthenticationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUnitOfWork _uow;
        private readonly IContactRepository _contactRepository;

        public Handler(SignInManager<AuthenticationUser> signInManager,
            UserManager<AuthenticationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            IUnitOfWork uow)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _uow = uow;
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Stream originalBodyStream = httpContextAccessor.HttpContext.Response.Body;
            using (var ms = new MemoryStream())
            {
                _httpContextAccessor.HttpContext.Response.Body = ms;

                _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
                await _signInManager.PasswordSignInAsync(request.model.Username, request.model.Password, false, lockoutOnFailure: false);

                ms.Seek(0, SeekOrigin.Begin);
                var responseBody = new StreamReader(ms).ReadToEnd();
                if (string.IsNullOrEmpty(responseBody))
                    throw new UnauthorizedException();

                var responseModel = JsonConvert.DeserializeObject<SignInResponse>(responseBody);
                _httpContextAccessor.HttpContext.Response.Headers.Append("access_token", responseModel.accessToken);
                _httpContextAccessor.HttpContext.Response.Headers.Append("refresh_token", responseModel.refreshToken);

                // ms.Seek(0, SeekOrigin.Begin);
                // await ms.CopyToAsync(originalBodyStream);

                // Another way
                // context.Response.Body = originalBodyStream;
                // await context.Response.Body.WriteAsync(ms.ToArray());


                // Update IsOnline true
                var user = await _userManager.FindByNameAsync(request.model.Username);
                _contactRepository.UseDatabase(typeof(Contact).Name, user.Id);
                var filter = MongoQuery<Contact>.EmptyFilter();
                var contact = (await _contactRepository.GetAllAsync(filter)).SingleOrDefault();
                // if (!contact.IsOnline)
                // {
                var updates = Builders<Contact>.Update
                    .Set(q => q.IsOnline, true);
                _contactRepository.Update(filter, updates);
                // }
            }

            return Unit.Value;
        }
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