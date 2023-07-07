using Microsoft.EntityFrameworkCore;

namespace MyDockerWebAPI.Repository
{
    public static class DatabaseMigration
    {
        public static void Migrate(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var context = scope.ServiceProvider.GetService<MigrationContext>();
                context.Database.Migrate();
            }
        }
    }
}