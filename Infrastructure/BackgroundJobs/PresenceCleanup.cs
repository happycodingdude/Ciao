namespace Infrastructure.BackgroundJobs;

public class PresenceCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public PresenceCleanupService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope =
                _scopeFactory.CreateScope();

            var presence =
                scope.ServiceProvider
                    .GetRequiredService<IPresenceService>();

            await presence.CleanupAsync();

            await Task.Delay(
                TimeSpan.FromSeconds(30),
                stoppingToken);
        }
    }
}
