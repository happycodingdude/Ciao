namespace Infrastructure.Repositories;

public class NotificationRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Notification>(context, httpContextAccessor), INotificationRepository
{ }