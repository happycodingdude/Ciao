namespace Infrastructure.RequestPipeline;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKafkaConsumers(this IServiceCollection services)
    {
        // services.AddSingleton<IHostedService>(sp =>
        // {
        //     var kafkaConfig = sp.GetRequiredService<IOptions<KafkaConfiguration>>();
        //     var mapper = sp.GetRequiredService<IMapper>();
        //     IUnitOfWork uow;
        //     using var scope = sp.CreateScope();
        //     uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        //     var conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
        //     var contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
        //     var consumer = new DataStoreConsumer(uow, mapper, conversationRepository, contactRepository);
        //     return new KafkaConsumer(
        //         [
        //             Topic.NewMessage
        //         ]
        //         , "message-db-consumer", consumer.ExecuteAsync, kafkaConfig);
        // });

        // services.AddSingleton<IHostedService>(sp =>
        // {
        //     var kafkaConfig = sp.GetRequiredService<IOptions<KafkaConfiguration>>();
        //     var mapper = sp.GetRequiredService<IMapper>();
        //     using var scope = sp.CreateScope();
        //     var messageCache = scope.ServiceProvider.GetRequiredService<MessageCache>();
        //     var conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
        //     var consumer = new CacheConsumer(mapper, messageCache, conversationRepository);
        //     return new KafkaConsumer(
        //         [
        //             Topic.NewMessage
        //         ]
        //         , "cache-consumer", consumer.ExecuteAsync, kafkaConfig);
        // });

        // services.AddSingleton<IHostedService>(sp =>
        // {
        //     var kafkaConfig = sp.GetRequiredService<IOptions<KafkaConfiguration>>();
        //     var mapper = sp.GetRequiredService<IMapper>();
        //     using var scope = sp.CreateScope();
        //     var conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
        //     var contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
        //     var notificationProcessor = scope.ServiceProvider.GetRequiredService<INotificationProcessor>();
        //     var consumer = new NotificationConsumer(mapper, conversationRepository, contactRepository, notificationProcessor);
        //     return new KafkaConsumer(
        //         [
        //             Topic.NewMessage
        //         ]
        //         , "notifiation-consumer", consumer.ExecuteAsync, kafkaConfig);
        // });

        return services;
    }
}
