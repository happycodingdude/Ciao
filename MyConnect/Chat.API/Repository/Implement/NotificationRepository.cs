namespace MyConnect.Repository
{
    public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(CoreContext context) : base(context) { }
    }
}