namespace Presentation.Identities;

public static class SignUp
{
    public record Request(IdentityRequest Model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IUnitOfWork uow)
        {
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly UserManager<AuthenticationUser> _userManager;


        public Handler(IValidator<Request> validator, UserManager<AuthenticationUser> userManager)
        {
            _validator = validator;
            _userManager = userManager;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = new AuthenticationUser
            {
                // Email = model.Username,
                UserName = request.Model.Username,
                PasswordHash = request.Model.Password
            };
            var result = await _userManager.CreateAsync(user, user.PasswordHash);
            if (result.Succeeded)
            {
                var created = await _userManager.GetUserIdAsync(user);
                var contact = new CreateContact
                {
                    Id = created,
                    Name = request.Model.Name
                };
            }

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