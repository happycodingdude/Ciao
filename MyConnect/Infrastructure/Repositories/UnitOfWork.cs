namespace Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context, MongoDbContext mongoDbContext, IHttpContextAccessor httpContextAccessor)
    {
        var dbName = httpContextAccessor.HttpContext.Session.GetString("UserId");
        _context = context;
        Contact = new ContactRepository(mongoDbContext, dbName);
        Conversation = new ConversationRepository(_context);
        Message = new MessageRepository(_context);
        Participant = new ParticipantRepository(_context);
        Schedule = new ScheduleRepository(_context);
        ScheduleContact = new ScheduleContactRepository(_context);
        Attachment = new AttachmentRepository(_context);
        Friend = new FriendRepository(mongoDbContext, dbName);
        Notification = new NotificationRepository(mongoDbContext, dbName);
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

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    private bool disposed = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }
        disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}