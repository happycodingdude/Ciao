using Microsoft.EntityFrameworkCore;
using MyConnect.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MyConnect.UOW;
using MyDockerWebAPI.RestApi;
using MyConnect.RestApi;
using MyConnect.Interface;
using MyConnect.Implement;
using Newtonsoft.Json;
using MyConnect.Configuration;
using Microsoft.AspNetCore.Diagnostics;
using MyConnect.Middleware;
using Microsoft.AspNetCore.Authorization;
using MyConnect.Authentication;
using Microsoft.AspNetCore.Identity;

namespace MyConnect
{
    public class Startup
    {
        public IConfiguration _configuration { get; }

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            Console.WriteLine("ConfigureServices running");
            services.AddDistributedMemoryCache();
            services.AddSession();
            services.AddControllers()
            .AddNewtonsoftJson(opt =>
            {
                opt.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                opt.SerializerSettings.ContractResolver = new IgnoreJsonAttributesResolver();
            });
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddHttpContextAccessor();
            services.AddDbContextPool<CoreContext>(option =>
            {
                string environment = _configuration["ASPNETCORE_ENVIRONMENT"];
                if (environment == "Development")
                    option.UseMySQL(_configuration.GetConnectionString("Db-Development"));
                else
                    option.UseMySQL(_configuration.GetConnectionString("Db-Production"));
            });
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["Jwt:Key"])),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                };
            });

            // Authorization
            services.AddSingleton<IAuthorizationHandler, AllUserHandle>();
            services.AddAuthorization(option =>
            {
                option.AddPolicy("AllUser", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.AddRequirements(new AllUserRequirement());
                });
            });

            // Exception handler
            services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();

            // Repository
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAttachmentRepository, AttachmentRepository>();
            services.AddScoped<IContactRepository, ContactRepository>();
            services.AddScoped<IConversationRepository, ConversationRepository>();
            services.AddScoped<IFriendRepository, FriendRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IParticipantRepository, ParticipantRepository>();
            services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
            services.AddScoped<IScheduleRepository, ScheduleRepository>();
            // Service
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IConversationService, ConversationService>();
            services.AddScoped<IFriendService, FriendService>();
            services.AddScoped<IMessageService, MessageService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IParticipantService, ParticipantService>();
            services.AddScoped<IScheduleContactService, ScheduleContactService>();
            services.AddScoped<IScheduleService, ScheduleService>();
            // Firebase
            services.AddScoped<IFirebaseFunction, FirebaseFunction>();
        }

        // public void Configure(WebApplication app, IWebHostEnvironment env)
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            Console.WriteLine("Configure running");
            // Configure the HTTP request pipeline.
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseExceptionHandler();
            }
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseSession();
            app.UseCors();

            // app.UseAuthentication();
            app.UseAuthorization();

            // app.UseEndpoints(endpoints =>
            // {
            //     endpoints.MapControllers();
            // });
            app.UseEndpoints(e => { });

            DatabaseMigration.Migrate(app);
            RedisCLient.Configure(_configuration);
        }

        private void OnStarted()
        {
        }

        private void OnStopping()
        {
        }
    }
}