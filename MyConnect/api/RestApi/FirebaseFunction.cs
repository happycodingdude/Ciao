using System.Text;
using MyConnect.RestApi;
using Newtonsoft.Json;

namespace MyDockerWebAPI.RestApi
{
    public class FirebaseFunction : IFirebaseFunction
    {
        private static readonly string NotifyEndpoint = "https://fcm.googleapis.com/fcm/send";
        private static readonly string SecretKey = "AAAALK9ydzY:APA91bG6GfcnWt_psliSV20KUD-UHbgRkfbEyBsLozoyOjbEbuLegJrUaM5mA9qsYUTrY2JQ4izPhRLLKmpAWdoQeUqkuzoIpSTn-dAx7JUEZ76R5Z0l0BomXupZ_Q3zWM4OUWtAKl_E";

        public async Task Notify(object data)
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={SecretKey}");
            var request = new HttpRequestMessage(new HttpMethod("POST"), NotifyEndpoint);
            var jsonStr = JsonConvert.SerializeObject(data);
            request.Content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
            var response = await httpClient.SendAsync(request);
            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine(result);
        }
    }
}