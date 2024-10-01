using Microsoft.AspNetCore.Authentication;

namespace Infrastructure.Middleware;

public class CheckSignoutMiddleware
{
    private readonly RequestDelegate _next;

    public CheckSignoutMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, SignInManager<AuthenticationUser> _signInManager, IContactRepository contactRepository)
    {
        Console.WriteLine("CheckSignoutMiddleware calling");

        // var user = httpContext.User;  
        // Console.WriteLine($"user => {user.Claims.FirstOrDefault(q => q.Type == "UserId")}");
        // Console.WriteLine($"user logged in => {user.Identity.IsAuthenticated}");
        var auth = await httpContext.AuthenticateAsync();
        if (auth?.Principal is not null)
        {
            var IssuedUtc = auth.Properties.IssuedUtc;
            Console.WriteLine($"issuedUtc => {IssuedUtc}");
            Console.WriteLine($"now => {DateTimeOffset.Now}");
            var ExpiresUtc = auth.Properties.ExpiresUtc;
            Console.WriteLine($"ExpiresUtc => {ExpiresUtc}");
        }


        // // Check for APIs not using basic authentication
        // var dbName = httpContext.Items["UserId"]?.ToString();
        // if (dbName is null)
        // {
        //     await _next(httpContext);
        //     return;
        // }

        // var userId = httpContext.Items["UserId"].ToString();
        // // contactRepository.UseDatabase(userId);
        // var user = await contactRepository.GetInfoAsync();
        // if (!user.IsOnline)
        //     throw new UnauthorizedException();

        await _next(httpContext);
    }
}