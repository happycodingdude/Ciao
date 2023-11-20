using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface INotificationService
    {
        Dictionary<Guid, string> Connections { get; }
        void RegisterToken(RegisterConnection param);
    }
}