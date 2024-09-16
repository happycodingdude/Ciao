namespace Infrastructure.Repositories;

public class ChangeTracking<T> : IChangeTracking<T> where T : MongoBaseModel
{
    MongoDbContext _context;

    public ChangeTracking(MongoDbContext context)
    {
        _context = context;
    }

    public async Task StartTrackingAsync(Func<ChangeStreamDocument<BsonDocument>, CancellationToken, Task> action, CancellationToken cancellationToken)
    {
        Console.WriteLine("StartTrackingAsync starting...");
        while (cancellationToken.IsCancellationRequested)
        {
            Console.WriteLine("StartTrackingAsync cancellationToken.IsCancellationRequested starting...");
        }
        // var pipeline = new EmptyPipelineDefinition<ChangeStreamDocument<T>>()
        //     .Match(change => change.OperationType == ChangeStreamOperationType.Update);
        // var options = new ChangeStreamOptions { FullDocument = ChangeStreamFullDocumentOption.UpdateLookup };
        using (var changeStream = _context.Client.GetDatabase(typeof(T).Name).Watch())
        {
            try
            {
                var changeHandlingTask = changeStream.ForEachAsync(async change =>
                {
                    Console.WriteLine("ForEachAsync starting...");
                    await Task.Delay(3000);
                    await action(change, cancellationToken);
                    return;
                }, cancellationToken);

                await Task.WhenAny(changeHandlingTask, Task.Delay(Timeout.Infinite, cancellationToken));

                // Respect the cancellation token
                Console.WriteLine($"cancellationToken.IsCancellationRequested => {cancellationToken.IsCancellationRequested}");
                if (cancellationToken.IsCancellationRequested)
                {
                    Console.WriteLine("Cancellation requested in StartTrackingAsync, stopping tracking...");
                    return;
                }
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("Operation canceled in StartTrackingAsync.");
            }
            finally
            {
                // Ensure the change stream is disposed when the loop exits
                changeStream.Dispose();
                Console.WriteLine("Change stream disposed.");
            }
        }
    }

    public void StopTracking()
    {

    }
}