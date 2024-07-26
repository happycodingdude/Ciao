namespace Chat.API.Features.Notifications;

public interface INotificationService : IBaseService<Domain.Features.Notification, NotificationDto>
{
    // string GetConnection(string id);
    // bool RegisterConnection(RegisterConnection param);
    // bool RemoveConnection(string id);
    // Task NotifyAsync(string _event, string connection);
    // Task NotifyAsync<T>(string _event, string connection, T data) where T : class;
    // IEnumerable<NotificationTypeConstraint> GetAllNotification(int page, int limit);
}