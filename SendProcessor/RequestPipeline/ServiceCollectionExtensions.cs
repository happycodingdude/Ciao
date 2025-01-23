namespace SendProcessor.RequestPipeline;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKafkaConsumer(this IServiceCollection services)
    {
        services.AddSingleton<IHostedService>(sp =>
        {
            var kafkaConfig = sp.GetRequiredService<IOptions<KafkaConfiguration>>();

            IKafkaMessageHandler messageHandler;
            using (var scope = sp.CreateScope())
            {
                messageHandler = scope.ServiceProvider.GetRequiredService<IKafkaMessageHandler>();
            }
            var consumerResultHanlder = new ConsumerResultHanlder(messageHandler);
            return new KafkaConsumer(
                [
                    Topic.SaveNewMessage
                ]
                , consumerResultHanlder.ExecuteAsync, kafkaConfig);
        });

        return services;
    }
}
