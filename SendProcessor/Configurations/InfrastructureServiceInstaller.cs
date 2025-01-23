namespace SendProcessor.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        // Common
        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSession();

        // Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        // Configuration
        services.Configure<KafkaConfiguration>(configuration.GetSection("Kafka"));

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

        // Json formatter
        services.Configure<JsonOptions>(opt =>
        {
            opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        // Authentication Dbcontext        
        services.AddDbContext<IdentityDbContext<AuthenticationUser>>();
        services.AddIdentityCore<IdentityUser>().AddEntityFrameworkStores<IdentityDbContext<AuthenticationUser>>().AddApiEndpoints();

        // Mongo
        services.AddSingleton<MongoDbContext>();

        // Authentication
        services.AddAuthentication();

        // Authorization
        services.AddAuthorization();

        // Kafka
        services.AddScoped<IKafkaMessageHandler, KafkaMessageHandler>();
        services.AddKafkaConsumer();
        services.AddSingleton<ProducerFactory>();
        services.AddSingleton<IKafkaProducer, KafkaProducer>();

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
        // Register IConnectionMultiplexer
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var config = $"{configuration["Redis:Server"]},password={configuration["Redis:Password"]}";
            return ConnectionMultiplexer.Connect(config);
        });
        // Register ISubscriber
        services.AddSingleton<ISubscriber>(sp =>
        {
            var connectionMultiplexer = sp.GetRequiredService<IConnectionMultiplexer>();
            return connectionMultiplexer.GetSubscriber();
        });
        services.AddSingleton<IRedisCaching, Redis>();

        // Core
        services.AddScoped(typeof(IService<>), typeof(Service<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Cache
        services.AddScoped<UserCache>();
        services.AddScoped<ConversationCache>();
        services.AddScoped<MessageCache>();

        // Repositories        
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IParticipantRepository, ParticipantRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();
        services.AddScoped<IFriendRepository, FriendRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();

        // External logic        
        services.AddSingleton<IFirebaseFunction, FirebaseFunction>();
    }
}
