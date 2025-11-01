namespace Application.Notifications;

public interface INotificationProcessor
{
    // Task Notify(string _event, string userId, object data);
    Task Notify(string _event, string[] userIds, object data);
    Task Notify(string _event, string userId, object data);
    Task Notify(string _event, string group, string userId, object data);
    Task Notify(string _event, string group, string uniqueId, string userId, object data);
}