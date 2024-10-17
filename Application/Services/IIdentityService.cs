namespace Application.Services;

public interface IIdentityService
{
    Task<AuthenticationUser> FindByNameAsync(string name);
}