namespace Presentation.Identities;

public static class SignUp
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly UserManager<AuthenticationUser> _userManager;
        private readonly IUnitOfWork _uow;
        private IContactRepository _contactRepository;

        public Handler(UserManager<AuthenticationUser> userManager, IUnitOfWork uow)
        {
            _userManager = userManager;
            _uow = uow;
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = new AuthenticationUser
            {
                // Email = model.Username,
                UserName = request.model.Username,
                PasswordHash = request.model.Password
            };
            var result = await _userManager.CreateAsync(user, user.PasswordHash);
            if (!result.Succeeded)
                throw new BadRequestException(JsonConvert.SerializeObject(result.Errors));

            var userId = await _userManager.GetUserIdAsync(user);
            // Tạo collection mới ở db Contact
            _contactRepository.UseDatabase(typeof(Contact).Name, userId);
            var contact = new Contact
            {
                Name = request.model.Name
            };
            _contactRepository.Add(contact);
            // Cập nhật lại collection All để làm search
            _contactRepository = _uow.GetService<IContactRepository>();
            _contactRepository.UseDatabase(typeof(Contact).Name, "All");
            _contactRepository.Add(contact);

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