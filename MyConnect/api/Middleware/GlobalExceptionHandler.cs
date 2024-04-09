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

            httpContext.Response.StatusCode = (int)response.code;
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
            return true;
        }
    }
}