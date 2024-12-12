namespace Infrastructure.Middleware;

public class GlobalTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, IUnitOfWork uow)
    {
        Console.WriteLine("GlobalTransactionMiddleware calling");
        await _next(httpContext);
        await uow.SaveAsync();
    }
}