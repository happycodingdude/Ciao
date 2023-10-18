using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Implement;
using MyDockerWebAPI.RestApi;

namespace MyDockerWebAPI
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
            })
            .AddDbContext<MigrationContext>(option =>
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
            builder.Services.AddScoped<ISubmissionService, SubmissionService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IFormService, FormService>();
            builder.Services.AddScoped<ILocationService, LocationService>();
            builder.Services.AddScoped<IParticipantService, ParticipantService>();
            builder.Services.AddScoped<TelegramFunction>();

            // Start Telegram service
            var serviceProvider = builder.Services.BuildServiceProvider();
            var telegramFunction = serviceProvider.GetService<TelegramFunction>();
            _ = telegramFunction.StartAsync();
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