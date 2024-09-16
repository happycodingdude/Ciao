namespace Infrastructure.BackgroundJob;

public class SyncContactAllCollection : BackgroundService
{
    readonly IChangeTracking<Contact> _changeTracking;
    Task _trackingTask;
    CancellationToken _localCancellationToken;

    public SyncContactAllCollection(IChangeTracking<Contact> changeTracking)
    {
        _changeTracking = changeTracking;
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("SyncContactAllCollection starting...");
        _localCancellationToken = cancellationToken;
        _trackingTask = _changeTracking.StartTrackingAsync(CollectionChange, cancellationToken);
        return Task.CompletedTask;
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("SyncContactAllCollection stopping...");
        await base.StopAsync(cancellationToken);
        Console.WriteLine($"cancellationToken.IsCancellationRequested => {cancellationToken.IsCancellationRequested}");
        Console.WriteLine($"_localCancellationToken => {_localCancellationToken.IsCancellationRequested}");

        if (_trackingTask != null)
        {
            Console.WriteLine($"_trackingTask.IsCanceled => {_trackingTask.IsCanceled}");
            Console.WriteLine($"_trackingTask.IsCompleted => {_trackingTask.IsCompleted}");
            Console.WriteLine($"_trackingTask.IsCompletedSuccessfully => {_trackingTask.IsCompletedSuccessfully}");
            try
            {
                // Request cancellation
                cancellationToken.ThrowIfCancellationRequested();

                // Wait for the tracking task to complete (respecting the cancellation token)
                await _trackingTask;
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("Operation canceled in StopAsync.");
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Some error => {ex.Message}");
            }
        }

    }

    async Task CollectionChange(ChangeStreamDocument<BsonDocument> change, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Operation Type: {change.OperationType}");
            Console.WriteLine($"Collection: {change.CollectionNamespace.CollectionName}");
            // Console.WriteLine($"changed => {changed.Id}");
            // // Cập nhật lại collection All để làm search
            // using var scope = _serviceScopeFactory.CreateScope();
            // var uow = scope.ServiceProvider.GetService<IUnitOfWork>();
            // var repo = uow.GetService<IContactRepository>();
            // repo.UseDatabase(typeof(Contact).Name, "All");
            // var filter = MongoQuery<Contact>.IdFilter(changed.Id);
            // var updates = Builders<Contact>.Update
            //     .Set(q => q.IsOnline, true);
            // repo.Update(filter, updates);
            // await uow.SaveAsync();     
            // if (cancellationToken.IsCancellationRequested)
            // {
            //     Console.WriteLine("Cancellation requested, stopping watch...");
            //     return Task.FromCanceled(cancellationToken);
            // }
            // Respect the cancellation token
            Console.WriteLine($"CollectionChange cancellationToken.IsCancellationRequested => {cancellationToken.IsCancellationRequested}");
            if (cancellationToken.IsCancellationRequested)
            {
                Console.WriteLine("Cancellation requested in CollectionChange, stopping operating...");
                return;
            }
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Operation canceled in CollectionChange.");
        }
    }
}
