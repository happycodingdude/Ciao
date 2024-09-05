using System.Reflection;

namespace Infrastructure.Middleware;

public class InitDatabaseMiddleware
{
    private readonly RequestDelegate _next;

    public InitDatabaseMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, IServiceProvider serviceProvider, MongoDbContext context)
    {
        Console.WriteLine("InitDatabaseMiddleware calling");

        var dbName = httpContext.Session.GetString("UserId");
        Console.WriteLine($"dbName => {dbName}");
        if (!string.IsNullOrEmpty(dbName))
        {
            var types = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(s => s.GetTypes())
                .Where(q => typeof(IInitDatabase).IsAssignableFrom(q) && q.IsInterface);

            foreach (var type in types)
            {
                var service = httpContext.RequestServices.GetService(type);
                // chỗ này service bị null
                if (service != null)
                    ((IInitDatabase)service).UseDatabase(dbName);
            }
        }
        else
        {

        }
        await _next(httpContext);
    }
}