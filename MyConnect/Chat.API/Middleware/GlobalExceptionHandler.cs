using Microsoft.AspNetCore.Diagnostics;
using MyConnect.Model;

namespace MyConnect.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            Console.WriteLine("GlobalExceptionHandler calling");

            var response = new ResponseModel1<object>();
            response.BadRequest(exception);

            // if (exception is UnauthorizedException)
            //     httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            // else
            //     httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
            return true;
        }
    }
}