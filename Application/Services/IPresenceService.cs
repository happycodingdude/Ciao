namespace Application.Services;

public interface IPresenceService
{
    Task UpdateActivityAsync(string userId);
    Task SetOfflineAsync(string userId);
    Task<bool> IsOnlineAsync(string userId);
    Task CleanupAsync();
}
