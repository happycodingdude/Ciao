using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Implement
{
    public class NotificationService : INotificationService
    {
        private static Dictionary<Guid, string> connections = new Dictionary<Guid, string>();

        public Dictionary<Guid, string> Connections
        {
            get
            {
                return connections;
            }
        }

        public void RegisterToken(RegisterConnection param)
        {
            connections[param.Id] = param.Token;
            // Console.WriteLine(JsonConvert.SerializeObject(connections));
            Console.WriteLine(connections.Count);
        }
    }
}