namespace Infrastructure.Repositories;

public class UnitOfWork(MongoDbContext mongoDbContext) : IUnitOfWork, IDisposable
{
    private IClientSessionHandle session;
    private List<Func<Task<object>>> operations = new List<Func<Task<object>>>();

    public void AddOperation<TResult>(Func<Task<TResult>> operation) where TResult : class
    {
        operations.Add(async () => await operation());
    }

    public async Task SaveAsync()
    {
        // For HTTP GET that's not perform any write command
        if (!operations.Any()) return;
        using (session = await mongoDbContext.Client.StartSessionAsync())
        {
            session.StartTransaction();

            foreach (var operation in operations)
            {
                var result = await operation.Invoke();
                Console.WriteLine($"operation result => {JsonConvert.SerializeObject(result)}");
            }

            await session.CommitTransactionAsync();
        }
    }

    public void Dispose()
    {
        session?.Dispose();
    }
}