namespace Presentation.Identities;

public static class SignUp
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    // public class Validator : AbstractValidator<Request>
    // {
    //     public Validator(IUnitOfWork uow)
    //     {
    //     }
    // }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly UserManager<AuthenticationUser> userManager;
        private readonly IUnitOfWork uow;
        private readonly IContactRepository contactRepository;

        public Handler(UserManager<AuthenticationUser> userManager, IServiceScopeFactory scopeFactory, IUnitOfWork uow)
        {
            this.userManager = userManager;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                contactRepository = scope.ServiceProvider.GetService<IContactRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = new AuthenticationUser
            {
                // Email = model.Username,
                UserName = request.model.Username,
                PasswordHash = request.model.Password
            };
            var result = await userManager.CreateAsync(user, user.PasswordHash);
            if (!result.Succeeded)
                throw new BadRequestException(JsonConvert.SerializeObject(result.Errors));

            var userId = await userManager.GetUserIdAsync(user);
            contactRepository.UseDatabase(userId);
            var contact = new Contact
            {
                Name = request.model.Name
            };
            contactRepository.Add(contact);
            await uow.SaveAsync();

            return Unit.Value;
        }
    }
}

public class SignUpEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Identity).MapPost("/signup",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new SignUp.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}