namespace Presentation.Identities;

public static class SignUp
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IUnitOfWork uow)
        {
        }
    }

    internal sealed class Handler(IValidator<Request> validator, UserManager<AuthenticationUser> userManager) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = new AuthenticationUser
            {
                // Email = model.Username,
                UserName = request.model.Username,
                PasswordHash = request.model.Password
            };
            var result = await userManager.CreateAsync(user, user.PasswordHash);
            if (result.Succeeded)
            {
                var created = await userManager.GetUserIdAsync(user);
                var contact = new CreateContact
                {
                    Id = created,
                    Name = request.model.Name
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