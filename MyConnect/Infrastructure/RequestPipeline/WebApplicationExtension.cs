namespace Infrastructure.RequestPipeline;

public static class WebApplicationExtension
{
    public static IApplicationBuilder UseDbTransaction(this IApplicationBuilder app)
            => app.UseMiddleware<DbTransactionMiddleware>();
    public static IApplicationBuilder UseAuthenticationDbTransaction(this IApplicationBuilder app)
            => app.UseMiddleware<AuthenticationDbTransactionMiddleware>();
}