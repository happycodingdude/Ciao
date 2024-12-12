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
                RuleFor(c => c.model.Username).MustAsync((item, cancellation) => UsernameMustBeUnique(item))
                    .WithMessage(req => $"Username '{req.model.Username}' existed");
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
        readonly IValidator<Request> _validator;
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IPasswordValidator _passwordValidator;
        IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IService<IContactRepository> service,
            IPasswordValidator passwordValidator)
        {
            _validator = validator;
            _contactRepository = service.Get();
            _passwordValidator = passwordValidator;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var error = await _passwordValidator.Validate(request.model.Password);
            if (!string.IsNullOrEmpty(error))
                throw new BadRequestException(error);

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
        app.MapGroup(AppConstants.ApiGroup_Identity).MapPost("/signup",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new SignUp.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}