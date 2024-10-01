namespace Presentation.Identities;

public static class SignUp
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
            }
            RuleFor(c => c.model.Username).NotEmpty().WithMessage("Username must not be empty").
            DependentRules(() =>
            {
                RuleFor(c => c.model.Username).MustAsync((item, cancellation) => UsernameMustBeUnique(item)).WithMessage("Username existed");
            });
            RuleFor(c => c.model.Password).NotEmpty().WithMessage("Password must not be empty");
        }

        async Task<bool> UsernameMustBeUnique(string username)
        {
            var user = await _contactRepository.GetByUsername(username);
            return user is null;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        // readonly UserManager<AuthenticationUser> _userManager;
        readonly IValidator<Request> _validator;
        readonly PasswordHasher<string> _passwordHasher = new();
        IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            // UserManager<AuthenticationUser> userManager, 
            IService<IContactRepository> service)
        {
            // _userManager = userManager;
            _validator = validator;
            _contactRepository = service.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());
            // if (!result.Succeeded)
            //     throw new BadRequestException(JsonConvert.SerializeObject(result.Errors));

            // var userId = await _userManager.GetUserIdAsync(user);
            // // _contactRepository.UseDatabase(userId);

            var hashPassword = _passwordHasher.HashPassword(request.model.Username, request.model.Password);
            var contact = new Contact
            {
                Name = request.model.Name,
                Username = request.model.Username,
                Password = hashPassword
            };
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