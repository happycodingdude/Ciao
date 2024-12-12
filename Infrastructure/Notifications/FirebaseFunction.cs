namespace Infrastructure.Notifications;

public class FirebaseFunction : IFirebaseFunction
{
    public FirebaseFunction()
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile($"{AppContext.BaseDirectory}/service-account-config.json")
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
        var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
    }
}