namespace Infrastructure.Repositories;

public class InvokeResult
{
    public bool IsAcknowledged { get; set; }
    public bool IsModifiedCountAvailable { get; set; }
    public int MatchedCount { get; set; }
    public int ModifiedCount { get; set; }
    public object UpsertedId { get; set; }
}

public class UnitOfWork(MongoDbContext mongoDbContext) : IUnitOfWork, IDisposable
{
    IClientSessionHandle session;
    Dictionary<Guid, Func<IClientSessionHandle, Task<object>>> operations = new Dictionary<Guid, Func<IClientSessionHandle, Task<object>>>();
    Dictionary<Guid, Func<IClientSessionHandle, Task<object>>> fallbacks = new Dictionary<Guid, Func<IClientSessionHandle, Task<object>>>();

    public void AddOperation<TResult>(Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class
    {
        operations.Add(Guid.NewGuid(), async (session) => await operation(session));
    }

    public void AddOperation<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class
    {
        operations.Add(key, async (session) => await operation(session));
    }

    public void AddFallback<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> fallback) where TResult : class
    {
        fallbacks.Add(key, async (session) => await fallback(session));
    }

    public async Task SaveAsync()
    {
        // For HTTP GET that's not perform any write command
        if (!operations.Any()) return;
        using (session = await mongoDbContext.Client.StartSessionAsync())
        {
            session.StartTransaction();
            try
            {
                foreach (var operation in operations)
                {
                    var result = await operation.Value.Invoke(session);
                    Console.WriteLine($"operation result => {JsonConvert.SerializeObject(result)}");
                    var invokeResult = JsonConvert.DeserializeObject<InvokeResult>(JsonConvert.SerializeObject(result));
                    if (invokeResult.ModifiedCount == 0)
                    {
                        fallbacks.TryGetValue(operation.Key, out var fallback);
                        if (fallback is null) continue;
                        var fallbackResult = await fallback.Invoke(session);
                        Console.WriteLine($"fallback result => {JsonConvert.SerializeObject(fallbackResult)}");
                    }
                }
                await session.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex.Message));
                await session.AbortTransactionAsync();
            }
        }
    }

    public void Dispose()
    {
        session?.Dispose();
    }
}