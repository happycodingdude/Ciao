using System.Reflection;

namespace Infrastructure.Utils.Firebase;

public class FirebaseFunction : IFirebaseFunction
{
    public async Task Notify(FirebaseNotification notification)
    {
        Console.WriteLine($"Path => {AppDomain.CurrentDomain.BaseDirectory}");
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile("./Features/Notification/Firebase/service-account-config.json")
        });

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
        await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
        // var httpClient = new HttpClient();

        // FirebaseApp.Create(new AppOptions()
        // {
        //     Credential = GoogleCredential.FromFile("../../../myconnect-f2af8-firebase-adminsdk-abqhf-234f3deeaf.json"),
        //     ProjectId = "myconnect-f2af8"
        // });
        // var customToken = await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync("trint");
        // Console.WriteLine(customToken);

        //https://developers.google.com/oauthplayground/?code=4/0ATx3LY4Z-kE6WE5ogtWAVSPh2pysRa3V99Y419rBPjkSOyNU_VXSqp0oOuYC9-ifK9yiHg&scope=https://www.googleapis.com/auth/firebase.messaging%20https://www.googleapis.com/auth/firebase


        // httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={Constants.Firebase_SecretKey}");
        // var request = new HttpRequestMessage(new HttpMethod("POST"), Constants.Firebase_NotifyEndpoint);
        // var jsonStr = JsonSerializer.Serialize(data, Constants.JsonSerialization.SerializeOptions);
        // // Console.WriteLine(jsonStr);
        // request.Content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
        // var response = await httpClient.SendAsync(request);
        // var result = await response.Content.ReadAsStringAsync();
        // Console.WriteLine(result);
    }
}