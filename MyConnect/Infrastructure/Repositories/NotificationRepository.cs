namespace Infrastructure.Repositories;

public class NotificationRepository(MongoDbContext context) : MongoBaseRepository<Notification>(context), INotificationRepository { }