namespace Presentation.Identities;

public static class ForgotPassword
{
    public record Request(IdentityRequest model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IPasswordValidator _passwordValidator;
        readonly IContactRepository _contactRepository;

        public Handler(IPasswordValidator passwordValidator, IContactRepository contactRepository)
        {
            _passwordValidator = passwordValidator;
            _contactRepository = contactRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            // var user = await userManager.FindByNameAsync(request.model.Username);
            // var token = await userManager.GeneratePasswordResetTokenAsync(user);
            // await userManager.ResetPasswordAsync(user, token, request.model.Password);

            var user = await _contactRepository.GetByUsername(request.model.Username);
            if (user is null)
                throw new BadRequestException("Username not found");

            var error = await _passwordValidator.Validate(request.model.Password);
            if (!string.IsNullOrEmpty(error))
                throw new BadRequestException(error);

            var hashPassword = _passwordHasher.HashPassword(request.model.Username, request.model.Password);
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update.Set(q => q.Password, hashPassword);
            _contactRepository.Update(filter, updates);

            return Unit.Value;
        }
    }
}

public class ForgotPasswordEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Identity).MapPost("/forgot",
        async (ISender sender, IdentityRequest model) =>
        {
            var request = new ForgotPassword.Request(model);
            await sender.Send(request);
            return Results.Ok();
        });
    }
}