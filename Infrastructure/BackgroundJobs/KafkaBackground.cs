namespace Infrastructure.BackgroundJobs;

public class KafkaBackground : BackgroundService
{
    readonly IOptions<KafkaConfiguration> _kafkaConfig;
    readonly IServiceProvider _serviceProvider;
    readonly ILogger _logger;

    public KafkaBackground(IOptions<KafkaConfiguration> kafkaConfig, IServiceProvider serviceProvider, ILogger logger)
    {
        _kafkaConfig = kafkaConfig;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        _ = Task.Run(() => ConsumeAsync<DataStoreConsumer>(
            new KafkaConsumer()
                .UseGroup("datastore-consumer")
                .Subscribe([
                    Topic.NewMessage,
                    Topic.NewGroupConversation,
                    Topic.NewDirectConversation,
                    Topic.NewMember,
                    Topic.NewReaction
                    ])
                .Build(),
            cancellationToken));

        _ = Task.Run(() => ConsumeAsync<CacheConsumer>(
            new KafkaConsumer()
                .UseGroup("cache-consumer")
                .Subscribe([
                    Topic.UserLogin,
                    Topic.StoredMessage,
                    Topic.StoredGroupConversation,
                    Topic.StoredDirectConversation,
                    Topic.StoredMember,
                    Topic.StoredReaction
                    ])
                .Build(),
            cancellationToken));

        _ = Task.Run(() => ConsumeAsync<NotificationConsumer>(
            new KafkaConsumer()
                .UseGroup("notification-consumer")
                .Subscribe([
                    Topic.StoredMessage,
                    Topic.StoredGroupConversation,
                    Topic.StoredDirectConversation,
                    Topic.StoredMember,
                    Topic.NotifyNewReaction
                    ])
                .Build(),
            cancellationToken));

        return Task.CompletedTask;
    }

    async Task ConsumeAsync<T>(KafkaConsumer kafkaConsumer, CancellationToken cancellationToken) where T : IGenericConsumer
    {
        try
        {
            if (!kafkaConsumer._topics.Any())
            {
                _logger.Information("No topics to listen for {Consumer}", typeof(T).Name);
                return;
            }

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = _kafkaConfig.Value.BootstrapServers,
                GroupId = kafkaConsumer._groupId,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            try
            {
                await InitTopicIfNotExist(kafkaConsumer._topics, consumerConfig);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to init Kafka topics for {Consumer}", typeof(T).Name);
            }

            using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
            consumer.Subscribe(kafkaConsumer._topics);
            _logger.Information("{Consumer} is listening on topics: {Topics}", typeof(T).Name, string.Join(", ", kafkaConsumer._topics));

            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        var cr = consumer.Consume(_kafkaConfig.Value.ConsumeTimeOut);
                        if (cr is null) continue;

                        // Create a new scope per message so Scoped services (UnitOfWork, Repositories)
                        // are isolated and don't accumulate state across messages.
                        using var scope = _serviceProvider.CreateScope();
                        var handler = scope.ServiceProvider.GetRequiredService<T>();
                        await handler.ProcessMessageAsync(new ConsumerResultData(cr, consumer), cancellationToken);
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.Error(ex, "Kafka consume error in {Consumer}", typeof(T).Name);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                consumer.Close();
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Fatal error in {Consumer}", typeof(T).Name);
        }
    }

    async Task InitTopicIfNotExist(List<string> topics, ConsumerConfig config)
    {
        using var adminClient = new AdminClientBuilder(config).Build();
        var metadata = adminClient.GetMetadata(TimeSpan.FromSeconds(30));
        var existingTopics = metadata.Topics.Select(a => a.Topic).ToHashSet();
        var newTopics = topics
            .Where(t => !existingTopics.Contains(t))
            .Select(t => new TopicSpecification { Name = t })
            .ToList();
        if (newTopics.Count > 0)
            await adminClient.CreateTopicsAsync(newTopics);
    }
}
