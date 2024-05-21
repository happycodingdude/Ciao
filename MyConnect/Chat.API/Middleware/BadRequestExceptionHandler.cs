namespace Chat.API.Middleware;

public class BadRequestExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        Console.WriteLine("BadRequestExceptionHandler calling");
        if (exception is not BadRequestException) return false;

        // var response = new ResponseModel1<object>();
        // response.BadRequest(exception);
        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsync(exception.Message, cancellationToken);
        // await httpContext.Response.WriteAsJsonAsync(exception.Message, cancellationToken);
        return true;
    }
}