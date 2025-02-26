namespace Chat.API.Configuration;

public static class LogExtension
{
    public static void AddSerilog(this IHostBuilder host)
    {
        host.UseSerilog((ctx, cf) => cf.ReadFrom.Configuration(ctx.Configuration));
    }
}