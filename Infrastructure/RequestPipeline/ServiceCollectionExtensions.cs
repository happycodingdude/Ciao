using Infrastructure.BackgroundJobs;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKafkaConsumer(this IServiceCollection services, string kafkaTopic)
    {
        services.AddSingleton<IHostedService>(sp =>
        {
            return new KafkaConsumer();
        });

        return services;
    }
}
