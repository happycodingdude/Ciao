namespace Infrastructure.Utils.Firebase;

public class FirebaseFunction : IFirebaseFunction
{
    static FirebaseFunction()
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile($"{AppDomain.CurrentDomain.BaseDirectory}/service-account-config.json")
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
                { "event_name", notification._event },
                { "data", JsonConvert.SerializeObject(notification.data) }
            }
        };
        Console.WriteLine($"message => {JsonConvert.SerializeObject(message)}");
        var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
        Console.WriteLine($"response => {JsonConvert.SerializeObject(response)}");
    }
}