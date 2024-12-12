namespace Infrastructure.Repositories;

public class NotificationRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Notification>(context, uow), INotificationRepository { }