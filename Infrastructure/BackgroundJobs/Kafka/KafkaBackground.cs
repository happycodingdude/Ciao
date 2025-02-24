namespace Infrastructure.BackgroundJobs;

/// <summary>
/// Description: Lớp này chạy background job lắng nghe message từ Kafka
/// </summary>
public class KafkaBackground : BackgroundService
{
    readonly IOptions<KafkaConfiguration> _kafkaConfig;
    readonly IServiceProvider _serviceProvider;

    public KafkaBackground(IOptions<KafkaConfiguration> kafkaConfig, IServiceProvider serviceProvider)
    {
        _kafkaConfig = kafkaConfig;
        _serviceProvider = serviceProvider;
    }

    // protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    // {
    //     var tasks = new List<Task>
    //     {
    //         ConsumeAsync<DataStoreConsumer>(
    //             new KafkaConsumer()
    //                 .UseGroup("datastore-consumer")
    //                 .Subscribe([Topic.NewMessage])
    //                 .Build()
    //                 , cancellationToken),
    //         ConsumeAsync<CacheConsumer>(
    //             new KafkaConsumer()
    //                 .UseGroup("cache-consumer")
    //                 .Subscribe([Topic.NewMessage])
    //                 .Build()
    //                 , cancellationToken),
    //         ConsumeAsync<NotificationConsumer>(
    //             new KafkaConsumer()
    //                 .UseGroup("notification-consumer")
    //                 .Subscribe([Topic.NewMessage])
    //                 .Build()
    //                 , cancellationToken)
    //     };

    //     await Task.WhenAll(tasks);

    //     // return Task.Run(() =>
    //     // {
    //     //     _ = ConsumeAsync<DataStoreConsumer>(
    //     //         new KafkaConsumer()
    //     //             .UseGroup("datastore-consumer")
    //     //             .Subscribe([Topic.NewMessage])
    //     //             .Build()
    //     //             , cancellationToken);
    //     //     _ = ConsumeAsync<CacheConsumer>(
    //     //         new KafkaConsumer()
    //     //             .UseGroup("cache-consumer")
    //     //             .Subscribe([Topic.NewMessage])
    //     //             .Build()
    //     //             , cancellationToken);
    //     //     _ = ConsumeAsync<NotificationConsumer>(
    //     //         new KafkaConsumer()
    //     //             .UseGroup("notification-consumer")
    //     //             .Subscribe([Topic.NewMessage])
    //     //             .Build()
    //     //             , cancellationToken);
    //     // });
    // }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        _ = Task.Run(() => ConsumeAsync<DataStoreConsumer>(
            new KafkaConsumer().UseGroup("datastore-consumer").Subscribe([Topic.NewMessage, Topic.NewConversation]).Build(),
            cancellationToken));

        _ = Task.Run(() => ConsumeAsync<CacheConsumer>(
            new KafkaConsumer().UseGroup("cache-consumer").Subscribe([Topic.NewMessage, Topic.NewConversation]).Build(),
            cancellationToken));

        _ = Task.Run(() => ConsumeAsync<NotificationConsumer>(
            new KafkaConsumer().UseGroup("notification-consumer").Subscribe([Topic.NewMessage, Topic.NewConversation]).Build(),
            cancellationToken));

        return Task.CompletedTask;
    }


    async Task ConsumeAsync<T>(KafkaConsumer kafkaConsumer, CancellationToken cancellationToken) where T : IGenericConsumer
    {
        try
        {
            if (!kafkaConsumer._topics.Any())
            {
                Console.WriteLine("No topics to listen...");
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
                Console.WriteLine(ex);
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

                    Console.WriteLine("Listening kafka topics...");
                    while (!cancellationToken.IsCancellationRequested)
                    {
                        // Check if partition unassigned then re-assign
                        // if (!_consumer.Assignment.Any())
                        //     ReAssignPartition();

                        try
                        {
                            var cr = consumer.Consume(_kafkaConfig.Value.ConsumeTimeOut);
                            if (cr is not null)
                            {
                                await consumerHandler.ProcessMesageAsync(new ConsumerResultData(cr, consumer));
                            }
                        }
                        catch (ConsumeException ex)
                        {
                            Console.WriteLine($"Kafka consume error: {ex}");
                        }
                    }
                }
                catch (OperationCanceledException ex)
                {
                    // Ensure the consumer leaves the group cleanly and final offsets are committed.
                    consumer.Close();
                    Console.WriteLine(ex);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
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
