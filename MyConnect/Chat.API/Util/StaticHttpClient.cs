using System.Net.Http.Headers;

namespace Chat.API.Util;

public static class StaticHttpClient
{
    public static readonly HttpClient client = new();

    static StaticHttpClient()
    {
        client.BaseAddress = new Uri("http://localhost:4100");
    }

    public static HttpClient AddToken(string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}