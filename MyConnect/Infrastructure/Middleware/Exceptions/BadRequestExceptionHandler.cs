namespace Infrastructure.Middleware.Exceptions;

public class BadRequestException : Exception
{
    public BadRequestException(string message, Exception innerEx = null) : base(message, innerEx) { }
}

public class BadRequestExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        Console.WriteLine("BadRequestExceptionHandler calling");
        if (exception is not BadRequestException) return false;

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsync(exception.Message, cancellationToken);
        return true;
    }
}