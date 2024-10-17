namespace Infrastructure.Repositories;

// public class NotificationRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Notification>(context, uow, httpContextAccessor), INotificationRepository
// { }
public class NotificationRepository : MongoBaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : base(context, uow, httpContextAccessor)
    {
        // UserWarehouseDB();
    }
}