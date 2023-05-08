using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI
{
    public class StartupMigration
    {
        private WebApplication? _app;

        public void ConfigureServices(WebApplicationBuilder builder)
        {
            builder.Services.AddDbContext<LibraryContext>(option =>
            {
                option.UseMySQL(builder.Configuration.GetConnectionString("MyDbContext"));
            });
        }

        public void Configure(WebApplication app)
        {
            _app = app;
            _app.Lifetime.ApplicationStarted.Register(OnStarted);
            _app.Lifetime.ApplicationStopping.Register(OnStopping);
        }

        private void OnStarted()
        {
        }

        private void OnStopping()
        {
        }
    }
}