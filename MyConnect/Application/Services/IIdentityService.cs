namespace Application.Services;

public interface IIdentityService
{
    Task<AuthenticationUser> FindByNameAsync();
}