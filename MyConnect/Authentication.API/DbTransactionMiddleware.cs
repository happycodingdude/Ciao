namespace Authentication.API;

public class DbTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public DbTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, AppDbContext context)
    {
        Console.WriteLine("DbTransactionMiddleware calling");
        // For HTTP GET opening transaction is not required
        if (httpContext.Request.Method.Equals("GET", StringComparison.CurrentCultureIgnoreCase))
        {
            await _next(httpContext);
            return;
        }

        IDbContextTransaction transaction = null;

        try
        {
            transaction = context.Database.BeginTransaction(IsolationLevel.ReadUncommitted);

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