namespace Infrastructure.BackgroundJobs;

/// <summary>
/// Description: Lớp này chạy background job lắng nghe message từ Kafka
/// </summary>
public class KafkaConsumer : BackgroundService
{
    static IConsumer<string, string> _consumer;
    static Partition _partition = new Partition(0);
    static List<TopicPartitionOffset> _partitions = new List<TopicPartitionOffset>();
    readonly IOptions<KafkaConfiguration> _kafkaConfig;
    readonly List<string> _topics =
    [
    ];
    readonly ConsumeMessage _consumeMessage;

    public KafkaConsumer(ConsumeMessage consumeMessage)
    {
        _consumeMessage = consumeMessage;
    }

    protected override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        return Task.Run(() =>
        {
            _ = ConsumeAsync(cancellationToken);
        });
    }

    async Task ConsumeAsync(CancellationToken cancellationToken)
    {
        try
        {
            if (!_topics.Any())
            {
                Console.WriteLine("No topics to listen...");
                return;
            }

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = _kafkaConfig.Value.BootstrapServers,
                GroupId = _kafkaConfig.Value.GroupId,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            // Init topic before subscribe if topic not exist
            await InitTopicIfNotExist(consumerConfig);

            using (_consumer = new ConsumerBuilder<string, string>(consumerConfig).Build())
            {
                // Combine both subscribe and assign to ensure partition assigned
                EnsurePartitionAssigned();

                try
                {
                    Console.WriteLine("Listening kafka topics...");

                    while (!cancellationToken.IsCancellationRequested)
                    {
                        // Check if partition unassigned then re-assign
                        if (!_consumer.Assignment.Any())
                            ReAssignPartition();

                        var cr = _consumer.Consume(_kafkaConfig.Value.ConsumeTimeOut);
                        if (cr != null)
                            await _consumeMessage(new ConsumerResultData(cr, _consumer));
                    }
                }
                catch (OperationCanceledException ex)
                {
                    // Ensure the consumer leaves the group cleanly and final offsets are committed.
                    _consumer.Close();
                    Console.WriteLine(ex);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    async Task InitTopicIfNotExist(ConsumerConfig config)
    {
        using (var adminClient = new AdminClientBuilder(config).Build())
        {
            var metadata = adminClient.GetMetadata(TimeSpan.FromSeconds(30));
            var topicsApp = metadata.Topics.Select(a => a.Topic).ToList();
            var topicsNotExist = _topics.Where(topic => !topicsApp.Any(item => item == topic))
                .Select(item => new TopicSpecification { Name = item })
                .ToList();
            if (topicsNotExist != null && topicsNotExist.Count > 0) await adminClient.CreateTopicsAsync(topicsNotExist);
        }
    }

    void EnsurePartitionAssigned()
    {
        _consumer.Subscribe(_topics);
        foreach (var topic in _topics)
            _partitions.Add(new TopicPartitionOffset(topic, _partition, Offset.End));
        _consumer.Assign(_partitions);
    }

    void ReAssignPartition()
    {
        _consumer.Unsubscribe();
        _consumer.Unassign();
        _consumer.Subscribe(_topics);
        _consumer.Assign(_partitions);
    }
}
