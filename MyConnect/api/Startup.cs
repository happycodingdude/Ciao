using Microsoft.EntityFrameworkCore;
using MyConnect.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MyConnect.UOW;

namespace MyConnect
{
    public class Startup
    {
        public void ConfigureServices(WebApplicationBuilder builder)
        {
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession();
            builder.Services.AddControllers().AddNewtonsoftJson(opt => opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services
            .AddDbContextPool<CoreContext>(option =>
            {
                option.UseMySQL(builder.Configuration.GetConnectionString("MyDbContext"));
            });
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"])),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero
                    };
                });
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        }

        public void Configure(WebApplication app)
        {
            app.UseSession();
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.MapControllers();
            app.UseAuthentication();
            app.UseAuthorization();
            app.Lifetime.ApplicationStarted.Register(OnStarted);
            app.Lifetime.ApplicationStopping.Register(OnStopping);

            DatabaseMigration.Migrate(app);
        }

        private void OnStarted()
        {
        }

        private void OnStopping()
        {
        }
    }
}