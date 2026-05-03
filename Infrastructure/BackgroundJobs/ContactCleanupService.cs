namespace Infrastructure.BackgroundJobs;

public class ContactCleanupService : BackgroundService
{
    private static readonly TimeSpan _interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan _staleThreshold = TimeSpan.FromDays(7);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger _logger;

    public ContactCleanupService(IServiceScopeFactory scopeFactory, ILogger logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ResetStaleOnlineContactsAsync(stoppingToken);
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task ResetStaleOnlineContactsAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();

            var threshold = DateTime.UtcNow.Subtract(_staleThreshold);
            await contactRepository.ResetStaleOnlineStatusAsync(threshold, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // graceful shutdown
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error resetting stale online status for contacts");
        }
    }
}
