namespace Infrastructure.Repositories;

public class NotificationRepository : MongoBaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(MongoDbContext context) : base(context) { }
}