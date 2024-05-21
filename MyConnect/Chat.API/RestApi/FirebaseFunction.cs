namespace MyDockerWebAPI.RestApi;

public class FirebaseFunction : IFirebaseFunction
{
    public async Task Notify(object data)
    {
        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={Constants.Firebase_SecretKey}");
        var request = new HttpRequestMessage(new HttpMethod("POST"), Constants.Firebase_NotifyEndpoint);
        var jsonStr = JsonConvert.SerializeObject(data);
        // Console.WriteLine(jsonStr);
        request.Content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
        var response = await httpClient.SendAsync(request);
        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}