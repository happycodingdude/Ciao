namespace Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private IClientSessionHandle session;
    private List<Action> operations;
    private MongoDbContext _mongoDbContext;
    // private readonly AppDbContext _context;

    // public UnitOfWork(AppDbContext context, MongoDbContext mongoDbContext, IHttpContextAccessor httpContextAccessor)
    public UnitOfWork(MongoDbContext mongoDbContext, IServiceProvider serviceProvider)
    {
        // Contact = serviceProvider.GetRequiredService<IContactRepository>();
        // Contact = new ContactRepository(mongoDbContext, this);
        // Conversation = new ConversationRepository(mongoDbContext, this);
        // Message = new MessageRepository(mongoDbContext, this);
        // Participant = new ParticipantRepository(mongoDbContext, this);
        // Schedule = new ScheduleRepository(mongoDbContext, this);
        // ScheduleContact = new ScheduleContactRepository(mongoDbContext, this);
        // Attachment = new AttachmentRepository(mongoDbContext, this);
        // Friend = new FriendRepository(mongoDbContext, this);
        // Notification = new NotificationRepository(mongoDbContext, this);
        _mongoDbContext = mongoDbContext;
        operations = new List<Action>();
    }

    public IContactRepository Contact { get; private set; }
    public IConversationRepository Conversation { get; private set; }
    public IMessageRepository Message { get; private set; }
    public IParticipantRepository Participant { get; private set; }
    public IScheduleRepository Schedule { get; private set; }
    public IScheduleContactRepository ScheduleContact { get; private set; }
    public IAttachmentRepository Attachment { get; private set; }
    public IFriendRepository Friend { get; private set; }
    public INotificationRepository Notification { get; private set; }

    public void AddOperation(Action operation)
    {
        operations.Add(operation);
    }

    public void CleanOperations()
    {
        operations.Clear();
    }

    public async Task SaveAsync()
    {
        using (session = await _mongoDbContext.Client.StartSessionAsync())
        {
            session.StartTransaction();

            operations.ForEach(o =>
            {
                o.Invoke();
            });

            // await Task.WhenAll(commandTasks);

            await session.CommitTransactionAsync();
            CleanOperations();
        }

        // session.StartTransaction();

        // operations.ForEach(o =>
        // {
        //     o.Invoke();
        // });

        // await session.CommitTransactionAsync();

    }

    //private bool disposed = false;

    // protected virtual void Dispose(bool disposing)
    // {
    //     if (!disposed)
    //     {
    //         if (disposing)
    //         {
    //             _context.Dispose();
    //         }
    //     }
    //     disposed = true;
    // }

    // public void Dispose()
    // {
    //     Dispose(true);
    //     GC.SuppressFinalize(this);
    // }

    public void Dispose()
    {
        session?.Dispose();
        GC.SuppressFinalize(this);
    }
}