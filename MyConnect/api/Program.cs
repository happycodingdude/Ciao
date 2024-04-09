using MyConnect;

var builder = WebApplication.CreateBuilder(args);

var configurationBuilder = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args);

var startup = new Startup(configurationBuilder.Build());
startup.ConfigureServices(builder.Services);
var app = builder.Build();

startup.Configure(app, builder.Environment);
MinimalAPI.Configure(app);
app.Run();
