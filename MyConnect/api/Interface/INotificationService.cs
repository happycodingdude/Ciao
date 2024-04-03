using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface INotificationService : IPatchService<Notification>
    {
        string GetConnection(string id);
        bool RegisterConnection(RegisterConnection param);
        bool RemoveConnection(string id);
        Task Notify(string[] connections);
        Task Notify(string[] connections, NotificationDto data);
        IEnumerable<NotificationDto> GetAll(int page, int limit);
    }
}