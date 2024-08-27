namespace Chat.API.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        // Common
        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSession();

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
        services.AddDbContext<AppDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("lab-chat-db")), ServiceLifetime.Singleton, ServiceLifetime.Singleton);

        // Authentication Dbcontext
        services.AddDbContext<AuthenticationDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("lab-authentication-db")), ServiceLifetime.Singleton, ServiceLifetime.Singleton);
        services.AddIdentityCore<AuthenticationUser>().AddEntityFrameworkStores<AuthenticationDbContext>().AddApiEndpoints();

        // Mongo
        services.AddSingleton<MongoDbContext>();

        // Authentication
        services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);

        // Authorization
        services.AddScoped<IAuthorizationHandler, BasicAuthenticationHandle>();
        services.AddAuthorization(option =>
        {
            option.AddPolicy("Basic", policy =>
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

        // Repositories
        services.AddSingleton<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IAttachmentRepository, AttachmentRepository>();
        services.AddSingleton<IContactRepository, ContactRepository>();
        services.AddSingleton<IConversationRepository, ConversationRepository>();
        services.AddSingleton<IFriendRepository, FriendRepository>();
        services.AddSingleton<IMessageRepository, MessageRepository>();
        services.AddSingleton<INotificationRepository, NotificationRepository>();
        services.AddSingleton<IParticipantRepository, ParticipantRepository>();
        services.AddSingleton<IScheduleContactRepository, ScheduleContactRepository>();
        services.AddSingleton<IScheduleRepository, ScheduleRepository>();

        // Business logics
        services.AddSingleton<IContactService, ContactService>();
        services.AddSingleton<IConversationService, ConversationService>();
        services.AddSingleton<IParticipantService, ParticipantService>();
        // services.AddSingleton<INotificationService, NotificationService>();
        services.AddSingleton<IFriendService, FriendService>();
        services.AddSingleton<IMessageService, MessageService>();
        services.AddSingleton<INotificationMethod, NotificationMethod>();
        services.AddSingleton<IFirebaseFunction, FirebaseFunction>();
        services.AddScoped<IIdentityService, IdentityService>();
    }
}
