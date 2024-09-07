namespace Infrastructure.Repositories;

// public class NotificationRepository : MongoBaseRepository<Notification>, INotificationRepository
// {
//     public NotificationRepository(MongoDbContext context) : base(context) { }
// }
public class NotificationRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Notification>(context, uow), INotificationRepository { }