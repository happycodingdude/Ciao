namespace Infrastructure.BackgroundJob;

public class SyncContactAllCollection : BackgroundService
{
    readonly IChangeTracking<Contact> _changeTracking;
    readonly IServiceScopeFactory _serviceScopeFactory;
    Task _trackingTask;

    public SyncContactAllCollection(IChangeTracking<Contact> changeTracking, IServiceScopeFactory serviceScopeFactory)
    {
        _changeTracking = changeTracking;
        _serviceScopeFactory = serviceScopeFactory;
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("SyncContactAllCollection starting...");
        // Keep a reference to handle graceful shutdown
        _trackingTask = _changeTracking.StartTrackingAsync(CollectionChange, cancellationToken);
        return Task.CompletedTask;
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("SyncContactAllCollection stopping...");
        // Always call base method to trigger cancellationToken
        await base.StopAsync(cancellationToken);
        // Finish all tasks as soon as posible
        if (_trackingTask != null)
            await _trackingTask;
    }

    async Task CollectionChange(ChangeStreamDocument<BsonDocument> change, CancellationToken cancellationToken)
    {
        var operation = change.OperationType.ToString();
        var collection = change.CollectionNamespace.CollectionName;
        if (collection == "All") return;

        // Update same contact in All collection for searching
        switch (operation)
        {
            case "Insert":
                await Add();
                break;
            case "Update":
                await Update();
                break;
            default:
                break;
        }

        async Task Add()
        {
            // using var scope = _serviceScopeFactory.CreateScope();

            // var service = scope.ServiceProvider.GetService<IService>();
            // var uow = scope.ServiceProvider.GetService<IUnitOfWork>();
            // var repo = service.Get<IContactRepository>(uow);
            // repo.UseDatabase(typeof(Contact).Name, "All");

            // var newContact = BsonSerializer.Deserialize<Contact>(change.FullDocument);
            // repo.Add(newContact);
            // await uow.SaveAsync();
        }

        async Task Update()
        {
            // using var scope = _serviceScopeFactory.CreateScope();

            // var service = scope.ServiceProvider.GetService<IService>();
            // var uow = scope.ServiceProvider.GetService<IUnitOfWork>();
            // var repo = service.Get<IContactRepository>(uow);
            // repo.UseDatabase(typeof(Contact).Name, collection);

            // var filter = MongoQuery<Contact>.EmptyFilter();
            // var contact = (await repo.GetAllAsync(filter)).SingleOrDefault();

            // repo.UseDatabase(typeof(Contact).Name, "All");
            // filter = MongoQuery<Contact>.IdFilter(change.DocumentKey["_id"].ToString());
            // var updates = Builders<Contact>.Update
            //     .Set(q => q.Name, contact.Name)
            //     .Set(q => q.Avatar, contact.Avatar)
            //     .Set(q => q.Bio, contact.Bio)
            //     .Set(q => q.IsOnline, contact.IsOnline)
            //     .Set(q => q.LastLogout, contact.LastLogout);

            // var all = await repo.GetItemAsync(filter);
            // repo.Update(filter, updates);
            // await uow.SaveAsync();
        }

        // Respect the cancellation token
        if (cancellationToken.IsCancellationRequested)
        {
            Console.WriteLine("Cancellation requested in CollectionChange, stopping operating...");
            return;
        }
    }
}
