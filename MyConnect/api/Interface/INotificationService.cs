using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface INotificationService
    {
        string GetConnection(string id);
        bool RegisterConnection(RegisterConnection param);
        bool RemoveConnection(string id);
        Task Notify(string[] connections, NotificationToNotify data);
    }
}