namespace Chat.API.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        // HttpClient
        services.AddHttpClient(AppConstants.HttpClient_Auth, client =>
        {
            client.BaseAddress = new Uri(AppConstants.ApiDomain_Auth);
        });

        // Json formatter
        services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(opt =>
        {
            // opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
            opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        // Dbcontext        
        services.AddDbContext<AppDbContext>(option =>
        {
            option.UseMySQL(configuration.GetConnectionString("Db-Development"));
        });

        // Authentication
        services.AddAuthentication();

        // Authorization
        services.AddSingleton<IAuthorizationHandler, BasicAuthenticationHandle>();
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
            opt.Configuration = $"{configuration["Redis:Host"]}:{configuration["Redis:Port"]},password={configuration["Redis:Pass"]}";
        });
        services.AddMemoryCache();
        services.AddSingleton<IRedisCaching, Redis>();

        // Repositories
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

        // Business logics
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IParticipantService, ParticipantService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IFriendService, FriendService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<INotificationMethod, NotificationMethod>();
        services.AddScoped<IFirebaseFunction, FirebaseFunction>();
    }
}
