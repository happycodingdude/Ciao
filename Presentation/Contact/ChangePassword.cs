namespace Presentation.Contacts;

public static class ChangePassword
{
    public record Request(ChangePasswordRequest model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.OldPassword).NotEmpty().WithMessage("Current password is required");
            RuleFor(c => c.model.NewPassword).NotEmpty().WithMessage("New password is required")
                .NotEqual(c => c.model.OldPassword).WithMessage("New password must be different from the current password");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        // Cùng cơ chế hash với SignIn/SignUp/ForgotPassword (salt theo Username).
        readonly PasswordHasher<string> _passwordHasher = new();
        readonly IValidator<Request> _validator;
        readonly IPasswordValidator _passwordValidator;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator, IPasswordValidator passwordValidator, IContactRepository contactRepository)
        {
            _validator = validator;
            _passwordValidator = passwordValidator;
            _contactRepository = contactRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Đọc từ DB (GetInfoAsync → GetItemAsync) để có Username + Password hash thật.
            // Không dùng UserCache: Contact trong cache bị [JsonIgnore] Password → hash rỗng.
            var user = await _contactRepository.GetInfoAsync();
            if (user is null)
                throw new BadRequestException("User not found");

            var verified = _passwordHasher.VerifyHashedPassword(user.Username, user.Password, request.model.OldPassword);
            if (verified == PasswordVerificationResult.Failed)
                throw new BadRequestException("Current password is incorrect");

            // Rule độ mạnh đồng nhất với SignUp/ForgotPassword.
            var error = await _passwordValidator.Validate(request.model.NewPassword);
            if (!string.IsNullOrEmpty(error))
                throw new BadRequestException(error);

            var newHash = _passwordHasher.HashPassword(user.Username, request.model.NewPassword);
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.Password, newHash)
                // Đổi mật khẩu = revoke session: xoá RefreshToken/ExpiryDate buộc đăng nhập lại.
                .Set(q => q.RefreshToken, null)
                .Set(q => q.ExpiryDate, null);
            _contactRepository.Update(filter, updates);

            return Unit.Value;
        }
    }
}

public class ChangePasswordEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPut("/password",
        async (ISender sender, ChangePasswordRequest model) =>
        {
            await sender.Send(new ChangePassword.Request(model));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
