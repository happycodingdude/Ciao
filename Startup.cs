using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Repository;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Implement;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MyDockerWebAPI
{
    public class Startup
    {
        private WebApplication? _app;

        public void ConfigureServices(WebApplicationBuilder builder)
        {
            // Add services to the container.
            builder.Services.AddControllers().AddNewtonsoftJson(opt => opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContextPool<LibraryContext>(option =>
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
            builder.Services.AddScoped<ILibraryService, LibraryService>();
        }

        public void Configure(WebApplication app)
        {
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            //app.UseHttpsRedirection();            
            app.MapControllers();
            app.UseAuthentication();
            app.UseAuthorization();
            app.Lifetime.ApplicationStarted.Register(OnStarted);
            app.Lifetime.ApplicationStopping.Register(OnStopping);
            _app = app;
        }

        private void OnStarted()
        {
        }

        private void OnStopping()
        {
        }
    }
}