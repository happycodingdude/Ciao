﻿namespace Infrastructure.BackgroundJobs;

/// <summary>
/// Description: Lớp này chạy background job lắng nghe message từ Kafka
/// </summary>
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
                _logger.Information("No topics to listen...");
                return;
            }

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = _kafkaConfig.Value.BootstrapServers,
                GroupId = kafkaConsumer._groupId,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            // Init topic before subscribe if topic not exist
            try
            {
                await InitTopicIfNotExist(kafkaConsumer._topics, consumerConfig);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "");
            }

            using (var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build())
            {
                // Combine both subscribe and assign to ensure partition assigned
                // EnsurePartitionAssigned();
                consumer.Subscribe(kafkaConsumer._topics);

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var consumerHandler = scope.ServiceProvider.GetRequiredService<T>();

                    // _logger.Information($"{typeof(T).Name} is listening kafka topics...");
                    _logger.Information($"{typeof(T).Name} is listening kafka topics...");

                    while (!cancellationToken.IsCancellationRequested)
                    {
                        // Check if partition unassigned then re-assign
                        // if (!_consumer.Assignment.Any())
                        //     ReAssignPartition();

                        try
                        {
                            var cr = consumer.Consume(_kafkaConfig.Value.ConsumeTimeOut);
                            if (cr is not null)
                                await consumerHandler.ProcessMesageAsync(new ConsumerResultData(cr, consumer));
                        }
                        catch (ConsumeException ex)
                        {
                            _logger.Information($"Kafka consume error: {ex}");
                        }
                    }
                }
                catch (OperationCanceledException ex)
                {
                    // Ensure the consumer leaves the group cleanly and final offsets are committed.
                    consumer.Close();
                    _logger.Error(ex, "");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "");
        }
    }

    async Task InitTopicIfNotExist(List<string> topics, ConsumerConfig config)
    {
        using (var adminClient = new AdminClientBuilder(config).Build())
        {
            var metadata = adminClient.GetMetadata(TimeSpan.FromSeconds(30));
            var topicsApp = metadata.Topics.Select(a => a.Topic).ToList();
            var topicsNotExist = topics.Where(topic => !topicsApp.Any(item => item == topic))
                .Select(item => new TopicSpecification { Name = item })
                .ToList();
            if (topicsNotExist is not null && topicsNotExist.Count > 0) await adminClient.CreateTopicsAsync(topicsNotExist);
        }
    }

    // void EnsurePartitionAssigned()
    // {
    //     _consumer.Subscribe(_topics);
    //     foreach (var topic in _topics)
    //         _partitions.Add(new TopicPartitionOffset(topic, _partition, Offset.End));
    //     _consumer.Assign(_partitions);
    // }

    // void ReAssignPartition()
    // {
    //     _consumer.Unsubscribe();
    //     _consumer.Unassign();
    //     _consumer.Subscribe(_topics);
    //     _consumer.Assign(_partitions);
    // }
}
