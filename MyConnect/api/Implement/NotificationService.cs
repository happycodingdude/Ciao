using MyConnect.Interface;

namespace MyConnect.Implement
{
    public class NotificationService : INotificationService
    {
        private static List<string> connections = new List<string>();

        public List<string> Connections
        {
            get
            {
                return connections;
            }
        }

        public void RegisterToken(string token)
        {
            if (!connections.Contains(token))
                connections.Add(token);
        }
    }
}