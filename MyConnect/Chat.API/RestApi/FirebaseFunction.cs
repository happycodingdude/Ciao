using System.Text;
using Chat.API.RestApi;
using Newtonsoft.Json;

namespace MyDockerWebAPI.RestApi
{
    public class FirebaseFunction : IFirebaseFunction
    {
        private static readonly string NotifyEndpoint = "https://fcm.googleapis.com/fcm/send";
        private static readonly string SecretKey = "AAAALK9ydzY:APA91bFwt95qNGKM-4UF4ZsyO-Ce68i1cM4UrY6G1u1WVlu6e6JfU56BjhdA54pQ60fboJ4wRZzrFP61c68JD1qU-wLTKFeuagb8EYio_Gre2f3TdYuGPy1Xap0SJ71j8WPCfySQ3GHY";

        public async Task Notify(object data)
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={SecretKey}");
            var request = new HttpRequestMessage(new HttpMethod("POST"), NotifyEndpoint);
            var jsonStr = JsonConvert.SerializeObject(data);
            // Console.WriteLine(jsonStr);
            request.Content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
            var response = await httpClient.SendAsync(request);
            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine(result);
        }
    }
}