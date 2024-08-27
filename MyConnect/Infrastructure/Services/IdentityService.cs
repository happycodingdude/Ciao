namespace Infrastructure.Services;

public class IdentityService(UserManager<AuthenticationUser> userManager) : IIdentityService
{
    public async Task<AuthenticationUser> FindByNameAsync(string name)
    {
        return await userManager.FindByNameAsync(name);
    }
}