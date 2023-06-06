using MyDockerWebAPI;
using MyDockerWebAPI.Authentication;

var builder = WebApplication.CreateBuilder(args);

KeyGenerator.GenerateRandom();

var startup = new Startup();
startup.ConfigureServices(builder);
var app = builder.Build();

startup.Configure(app);
app.Run();
