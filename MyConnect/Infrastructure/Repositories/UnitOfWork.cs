namespace Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    // private readonly AppDbContext _context;

    // public UnitOfWork(AppDbContext context, MongoDbContext mongoDbContext, IHttpContextAccessor httpContextAccessor)
    public UnitOfWork(MongoDbContext mongoDbContext, IHttpContextAccessor httpContextAccessor)
    {
        Contact = new ContactRepository(mongoDbContext);
        Conversation = new ConversationRepository(mongoDbContext);
        Message = new MessageRepository(mongoDbContext);
        Participant = new ParticipantRepository(mongoDbContext);
        Schedule = new ScheduleRepository(mongoDbContext);
        ScheduleContact = new ScheduleContactRepository(mongoDbContext);
        Attachment = new AttachmentRepository(mongoDbContext);
        Friend = new FriendRepository(mongoDbContext);
        Notification = new NotificationRepository(mongoDbContext);
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
        // await _context.SaveChangesAsync();
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
}