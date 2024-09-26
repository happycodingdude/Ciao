namespace Infrastructure.Middleware;

public class DbTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public DbTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, IUnitOfWork uow)
    {
        Console.WriteLine("DbTransactionMiddleware calling");
        await _next(httpContext);
        Console.WriteLine("transaction Commit");
        await uow.SaveAsync();
    }
}

public class AuthenticationDbTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public AuthenticationDbTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, AuthenticationDbContext context)
    {
        Console.WriteLine("AuthenticationDbTransactionMiddleware calling");
        // For HTTP GET opening transaction is not required
        if (httpContext.Request.Method.Equals("GET", StringComparison.CurrentCultureIgnoreCase))
        {
            await _next(httpContext);
            return;
        }

        IDbContextTransaction transaction = null;

        try
        {
            transaction = context.Database.CurrentTransaction ?? context.Database.BeginTransaction(IsolationLevel.ReadUncommitted);

            await _next(httpContext);

            Console.WriteLine("transaction Commit");
            transaction.Commit();
        }
        finally
        {
            Console.WriteLine("transaction Dispose");
            transaction?.Dispose();
        }
    }
}