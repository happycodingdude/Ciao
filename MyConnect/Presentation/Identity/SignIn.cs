namespace Presentation.Identities;

public static class SignIn
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly SignInManager<AuthenticationUser> signInManager;
        private readonly UserManager<AuthenticationUser> userManager;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IUnitOfWork uow;
        private readonly IContactRepository contactRepository;

        public Handler(SignInManager<AuthenticationUser> signInManager, UserManager<AuthenticationUser> userManager,
            IHttpContextAccessor httpContextAccessor, IServiceScopeFactory scopeFactory,
            IUnitOfWork uow)
        {
            this.signInManager = signInManager;
            this.userManager = userManager;
            this.httpContextAccessor = httpContextAccessor;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                contactRepository = scope.ServiceProvider.GetService<IContactRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // Stream originalBodyStream = httpContextAccessor.HttpContext.Response.Body;
            using (var ms = new MemoryStream())
            {
                httpContextAccessor.HttpContext.Response.Body = ms;

                signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
                await signInManager.PasswordSignInAsync(request.model.Username, request.model.Password, false, lockoutOnFailure: false);

                // Update IsOnline true
                // var user = await userManager.FindByNameAsync(request.model.Username);
                // contactRepository.UseDatabase(user.Id);
                var contact = (await contactRepository.GetAllAsync(Builders<Contact>.Filter.Empty)).SingleOrDefault();
                if (!contact.IsOnline)
                {
                    contact.IsOnline = true;
                    contactRepository.UpdateOne(Builders<Contact>.Filter.Empty, contact);
                    await uow.SaveAsync();
                }

                ms.Seek(0, SeekOrigin.Begin);
                var responseBody = new StreamReader(ms).ReadToEnd();
                if (string.IsNullOrEmpty(responseBody))
                    throw new UnauthorizedException();

                var responseModel = JsonConvert.DeserializeObject<SignInResponse>(responseBody);
                httpContextAccessor.HttpContext.Response.Headers.Append("access_token", responseModel.accessToken);
                httpContextAccessor.HttpContext.Response.Headers.Append("refresh_token", responseModel.refreshToken);

                // ms.Seek(0, SeekOrigin.Begin);
                // await ms.CopyToAsync(originalBodyStream);

                // Another way
                // context.Response.Body = originalBodyStream;
                // await context.Response.Body.WriteAsync(ms.ToArray());
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