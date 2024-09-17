namespace Infrastructure.Middleware;

public class CheckSignoutMiddleware
{
    private readonly RequestDelegate _next;

    public CheckSignoutMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, IContactRepository contactRepository)
    {
        Console.WriteLine("CheckSignoutMiddleware calling");

        // Check for APIs not using basic authentication
        var dbName = httpContext.Items["UserId"]?.ToString();
        if (dbName is null)
        {
            await _next(httpContext);
            return;
        }

        var userId = httpContext.Items["UserId"].ToString();
        var filter = Builders<Contact>.Filter.Where(q => q.UserId == userId);
        var user = await contactRepository.GetItemAsync(filter);
        if (!user.IsOnline)
            throw new UnauthorizedException();

        await _next(httpContext);
    }
}