namespace Infrastructure.Services;

public class NotificationService : BaseService<Notification, NotificationDto>, INotificationService
{
    public NotificationService(INotificationRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}