using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface INotificationService
    {
        string GetConnection(string id);
        void RegisterConnection(RegisterConnection param);
        void RemoveConnection(string id);
    }
}