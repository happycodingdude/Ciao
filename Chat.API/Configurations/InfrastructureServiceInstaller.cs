namespace Chat.API.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        // Configuration
        services.Configure<KafkaConfiguration>(configuration.GetSection("Kafka"));
        services.Configure<MongoConfiguration>(configuration.GetSection("Mongo"));
        services.Configure<RedisConfiguration>(configuration.GetSection("Redis"));
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        // Common
        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSession();

        // Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        // CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy
                    .WithOrigins(
                        configuration.GetSection("Cors:Origins").Get<string[]>()
                        ?? ["http://localhost:5000"])
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        // SignalR
        services.AddSignalR();

        // Json formatter
        services.Configure<JsonOptions>(opt =>
        {
            opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        // Identity
        services.AddDbContext<IdentityDbContext<AuthenticationUser>>();
        services.AddIdentityCore<IdentityUser>()
            .AddEntityFrameworkStores<IdentityDbContext<AuthenticationUser>>()
            .AddApiEndpoints();

        // MongoDB
        services.AddSingleton<MongoDbContext>();

        // Authentication
        services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);

        // Authorization
        services.AddScoped<IAuthorizationHandler, BasicAuthenticationHandle>();
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AppConstants.Authentication_Basic, policy =>
                policy.AddRequirements(new BasicAuthenticationRequirement()));
            options.DefaultPolicy = options.GetPolicy(AppConstants.Authentication_Basic);
        });

        // HttpClient
        services.AddHttpClient();

        // Global exception handlers
        services.AddExceptionHandler<UnauthorizedExceptionHandler>();
        services.AddExceptionHandler<BadRequestExceptionHandler>();
        services.AddProblemDetails();

        // Redis
        services.AddStackExchangeRedisCache(opt =>
        {
            var redisConfig = configuration.GetSection("Redis").Get<RedisConfiguration>()!;
            opt.Configuration = redisConfig.ConnectionString;
        });
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var redisConfig = configuration.GetSection("Redis").Get<RedisConfiguration>()!;
            return ConnectionMultiplexer.Connect(redisConfig.ConnectionString);
        });
        services.AddSingleton<ISubscriber>(sp =>
            sp.GetRequiredService<IConnectionMultiplexer>().GetSubscriber());
        services.AddMemoryCache();
        services.AddSingleton<IRedisCaching, RedisCaching>();

        // Core
        services.AddScoped(typeof(IService<>), typeof(Service<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();

        // Cache
        services.AddScoped<UserCache>();
        services.AddScoped<ConversationCache>();
        services.AddScoped<MessageCache>();
        services.AddScoped<MemberCache>();
        services.AddScoped<FriendCache>();

        // Repositories
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();
        services.AddScoped<IFriendRepository, FriendRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();

        // External services
        services.AddSingleton<IFirebaseFunction, FirebaseFunction>();
        services.AddScoped<IPasswordValidator, PasswordValidator>();
        services.AddSingleton<INotificationProcessor, WebSocketProcessor>();

        // Kafka
        services.AddSingleton<ProducerFactory>();
        services.AddSingleton<IKafkaProducer, KafkaProducer>();
        services.AddScoped<DataStoreConsumer>();
        services.AddScoped<CacheConsumer>();
        services.AddScoped<NotificationConsumer>();
        services.AddHostedService<KafkaBackground>();
        services.AddHostedService<PresenceCleanupService>();
        services.AddHostedService<ContactCleanupService>();

        // Services
        services.AddScoped<IPresenceService, RedisPresenceService>();
    }
}
