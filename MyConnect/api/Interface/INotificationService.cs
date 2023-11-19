namespace MyConnect.Interface
{
    public interface INotificationService
    {
        List<string> Connections { get; }
        void RegisterToken(string token);
    }
}