namespace Chat.API.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        // Serializer
        // var objectSerializer = new ObjectSerializer(type => ObjectSerializer.DefaultAllowedTypes(type) || type.FullName.StartsWith("<>f__AnonymousType"));
        // BsonSerializer.RegisterSerializer(objectSerializer);

        // Common
        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSession();

        // CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(
                policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });

        // HttpClient
        services.AddHttpClient(AppConstants.HttpClient_Auth, client =>
        {
            client.BaseAddress = new Uri(AppConstants.ApiDomain_Auth);
        });

        // Json formatter
        services.Configure<JsonOptions>(opt =>
        {
            // opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
            opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        // Chat Dbcontext        
        // services.AddDbContext<AppDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("lab-chat-db")), ServiceLifetime.Singleton, ServiceLifetime.Singleton);

        // Authentication Dbcontext        
        services.AddDbContext<IdentityDbContext<AuthenticationUser>>();
        services.AddIdentityCore<IdentityUser>().AddEntityFrameworkStores<IdentityDbContext<AuthenticationUser>>().AddApiEndpoints();
        // services.AddIdentityCore<IdentityUser>()
        //     .AddEntityFrameworkStores<IdentityDbContext<IdentityUser>>();

        // Mongo
        services.AddSingleton<MongoDbContext>();

        // Authentication
        // services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
        {
            options.ExpireTimeSpan = TimeSpan.FromDays(1);
            options.Cookie = new CookieBuilder
            {
                HttpOnly = true,
                Name = "Ciao-cookie"
            };
            options.Events.OnRedirectToLogin = context =>
            {
                Console.WriteLine("OnRedirectToLogin...");
                context.Response.StatusCode = 401;
                return Task.CompletedTask;
            };
            // options.SlidingExpiration = true;
            // options.AccessDeniedPath = "/Forbidden/";
        });

        // Authorization
        services.AddScoped<IAuthorizationHandler, BasicAuthenticationHandle>();
        services.AddAuthorization(option =>
        {
            option.AddPolicy(AppConstants.Authentication_Basic, policy =>
            {
                policy.AddRequirements(new BasicAuthenticationRequirement());
            });
        });

        // HttpClient
        services.AddHttpClient();

        // Global exception handler
        services.AddExceptionHandler<UnauthorizedExceptionHandler>();
        services.AddExceptionHandler<BadRequestExceptionHandler>();
        services.AddProblemDetails();

        // Redis        
        services.AddStackExchangeRedisCache(opt =>
        {
            opt.Configuration = $"{configuration["Redis:Server"]},password={configuration["Redis:Password"]}";
        });
        services.AddMemoryCache();
        services.AddSingleton<IRedisCaching, Redis>();

        // services.AddScoped<IService, Service>();
        services.AddScoped(typeof(IService<>), typeof(Service<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        // Repositories        
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IParticipantRepository, ParticipantRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();
        services.AddScoped<IFriendRepository, FriendRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        // services.AddSingleton(typeof(INotificationRepository<>), typeof(NotificationRepository<>));
        services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddSingleton(typeof(IChangeTracking<>), typeof(ChangeTracking<>));

        // Business logics
        // services.AddSingleton<IContactService, ContactService>();
        // services.AddSingleton<IConversationService, ConversationService>();
        // services.AddSingleton<IParticipantService, ParticipantService>();
        // services.AddSingleton<INotificationService, NotificationService>();
        // services.AddSingleton<IFriendService, FriendService>();
        // services.AddSingleton<IMessageService, MessageService>();
        services.AddSingleton<INotificationMethod, NotificationMethod>();
        services.AddSingleton<IFirebaseFunction, FirebaseFunction>();
        services.AddScoped<IPasswordValidator, PasswordValidator>();
        // services.AddScoped<IIdentityService, IdentityService>();

        // Background jobs
        // services.AddHostedService<SyncContactAllCollection>();
    }
}
