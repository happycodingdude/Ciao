using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface INotificationService : IBaseService<Notification, NotificationDto>
    {
        string GetConnection(string id);
        bool RegisterConnection(RegisterConnection param);
        bool RemoveConnection(string id);
        Task Notify(string _event, string connection);
        Task Notify<T>(string _event, string connection, T data) where T : class;
    }
}