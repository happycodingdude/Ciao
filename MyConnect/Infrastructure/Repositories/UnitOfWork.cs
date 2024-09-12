namespace Infrastructure.Repositories;

public class UnitOfWork(MongoDbContext mongoDbContext, IServiceScopeFactory serviceScopeFactory) : IUnitOfWork, IDisposable
{
    private IClientSessionHandle session;
    private List<Action> operations = new List<Action>();

    public T GetService<T>() where T : IInitDatabase
    {
        using var scope = serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetService<T>();
        service.UseUOW(this);
        return service;
    }

    public void AddOperation(Action operation)
    {
        operations.Add(operation);
    }

    public async Task SaveAsync()
    {
        // For HTTP GET that's not perform any write command
        if (!operations.Any()) return;
        using (session = await mongoDbContext.Client.StartSessionAsync())
        {
            session.StartTransaction();

            operations.ForEach(o =>
            {
                o.Invoke();
            });

            await session.CommitTransactionAsync();
        }
    }

    public void Dispose()
    {
        session?.Dispose();
    }
}