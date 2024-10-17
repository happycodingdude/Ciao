namespace Infrastructure.Repositories;

public class UnitOfWork(MongoDbContext mongoDbContext) : IUnitOfWork, IDisposable
{
    private IClientSessionHandle session;
    private List<Func<IClientSessionHandle, Task<object>>> operations = new List<Func<IClientSessionHandle, Task<object>>>();

    public void AddOperation<TResult>(Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class
    {
        operations.Add(async (session) => await operation(session));
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
                    var result = await operation.Invoke(session);
                    Console.WriteLine($"operation result => {JsonConvert.SerializeObject(result)}");
                }
                await session.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
                await session.AbortTransactionAsync();
            }
        }
    }

    public void Dispose()
    {
        session?.Dispose();
    }
}