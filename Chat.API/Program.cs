var builder = WebApplication.CreateBuilder(args);

// _logger.Information($"appsettings.{builder.Environment.EnvironmentName}.json");

var configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            // .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

builder.Services.InstallServices(builder.Configuration, builder.Environment, typeof(IServiceInstaller).Assembly);
builder.Host.AddSerilog();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseSession();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors();
// app.MapHub<SignalHub>("/ciaohub");
app.UseAuthentication();
app.UseAuthorization();

app.UseDbTransaction();
app.MapCarter();

Console.WriteLine("App is running...");

app.Run();