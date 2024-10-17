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
        // var pipeline = new EmptyPipelineDefinition<ChangeStreamDocument<T>>()
        //     .Match(change => change.OperationType == ChangeStreamOperationType.Update);
        // var options = new ChangeStreamOptions { FullDocument = ChangeStreamFullDocumentOption.UpdateLookup };
        using var changeStream = _context.Client.GetDatabase(typeof(T).Name).Watch();
        try
        {
            await changeStream.ForEachAsync(async change =>
            {
                await action(change, cancellationToken);
            }, cancellationToken);

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
    }

    public void StopTracking()
    {

    }
}