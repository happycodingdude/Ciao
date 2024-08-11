namespace Infrastructure.Services;

public class IdentityService(UserManager<AuthenticationUser> userManager/*, ClaimsPrincipal claimsPrincipal*/) : IIdentityService
{
    public async Task<AuthenticationUser> FindByNameAsync()
    {
        // return await userManager.FindByNameAsync(claimsPrincipal.Identity.Name);
        return null;
    }
}