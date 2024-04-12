using Microsoft.EntityFrameworkCore;
using Chat.API.Repository;
using Chat.API.UOW;
using MyDockerWebAPI.RestApi;
using Chat.API.RestApi;
using Chat.API.Interface;
using Chat.API.Implement;
using Chat.API.Configuration;
using Microsoft.AspNetCore.Authorization;
using Chat.API.Middleware;
using Chat.API.Authentication;
using Chat.API.Interface;
using Chat.API.Implement;

namespace Chat.API
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
            services.AddControllers();
            // .AddNewtonsoftJson(opt =>
            // {
            //     opt.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            //     opt.SerializerSettings.ContractResolver = new IgnoreJsonAttributesResolver();
            // });
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

            // Authentication
            services.AddAuthentication();

            // Authorization
            services.AddSingleton<IAuthorizationHandler, AllUserHandle>();
            services.AddAuthorization(option =>
            {
                option.AddPolicy("AllUser", policy =>
                {
                    policy.AddRequirements(new AllUserRequirement());
                });
            });

            // Exception handler
            services.AddExceptionHandler<BadRequestExceptionHandler>();
            services.AddExceptionHandler<UnauthorizedExceptionHandler>();
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

            app.UseAuthentication();
            app.UseAuthorization();

            // app.UseEndpoints(endpoints =>
            // {
            //     endpoints.MapControllers();
            // });
            // app.UseEndpoints(e => { });

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