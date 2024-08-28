namespace Infrastructure.Repositories;

public class NotificationRepository : MongoBaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
}