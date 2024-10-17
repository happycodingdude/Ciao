namespace Shared.Utils;

public interface IPasswordValidator
{
    Task<string> Validate(string password);
}

public class PasswordValidator : IPasswordValidator
{
    readonly PasswordValidator<IdentityUser> passwordValidator = new();
    readonly UserManager<IdentityUser> _userManager;

    public PasswordValidator(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string> Validate(string password)
    {
        var validPassword = await passwordValidator.ValidateAsync(_userManager, null, password);
        if (!validPassword.Succeeded)
        {
            var errors = validPassword.Errors.Select(q => q.Description);
            return string.Join("<br />", errors);
        }
        return string.Empty;
    }
}
