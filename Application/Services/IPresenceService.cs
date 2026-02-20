namespace Application.Services;

public interface IPresenceService
{
    Task UpdateActivityAsync(string userId);
    Task<bool> IsOnlineAsync(string userId);
    Task CleanupAsync();
}
