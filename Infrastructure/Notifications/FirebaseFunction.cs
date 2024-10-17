namespace Infrastructure.Notifications;

public class FirebaseFunction : IFirebaseFunction
{
    public FirebaseFunction()
    {
        var enviroment = Environment.CurrentDirectory;
        string projectDirectory = Directory.GetParent(enviroment).FullName;
        FirebaseApp.Create(new AppOptions()
        {
            // Credential = GoogleCredential.FromFile($"{AppDomain.CurrentDomain.BaseDirectory}/service-account-config.json")
            Credential = GoogleCredential.FromFile($"{projectDirectory}/Infrastructure/Notifications/service-account-config.json")
        });
    }

    public async Task Notify(FirebaseNotification notification)
    {
        var message = new MulticastMessage()
        {
            Tokens = notification.tokens,
            Notification = new FirebaseAdmin.Messaging.Notification()
            {
                Title = notification.title,
                Body = notification.body
            },
            Data = new Dictionary<string, string>()
            {
                { "event", notification._event },
                { "data", JsonConvert.SerializeObject(notification.data,
                    new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    })
                }
            }
        };
        // Console.WriteLine($"message => {JsonConvert.SerializeObject(message)}");
        var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
        Console.WriteLine($"response => {JsonConvert.SerializeObject(response)}");
    }
}