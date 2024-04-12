using Chat.API.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Chat.API.Model;

namespace Chat.API.Middleware
{
    public class BadRequestExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            Console.WriteLine("BadRequestExceptionHandler calling");
            if (exception is not BadRequestException) return false;

            var response = new ResponseModel1<object>();
            response.BadRequest(exception);
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
            return true;
        }
    }
}