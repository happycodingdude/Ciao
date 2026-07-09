namespace Application.Services;

public interface IPresenceService
{
    Task UpdateActivityAsync(string userId);
    Task SetOfflineAsync(string userId);
    Task<bool> IsOnlineAsync(string userId);
    // Last Seen (Phase 3): mốc hoạt động cuối, lưu bền ngoài presence set
    // (presence set bị PresenceCleanup xóa entry cũ nên không dùng làm last seen được).
    Task<DateTime?> GetLastActiveAsync(string userId);
    Task CleanupAsync();
}
