namespace Infrastructure.Kafka.Producer;

/// <summary>
/// Description: Lớp này khai báo 1 static instance producer, dùng để giữ 1 kết nối đến kafka, không tạo mới kết nối mỗi lần gọi tránh TH full TCP connection
/// </summary>
public class ProducerFactory
{
    public IProducer<string, string> producer;

    public ProducerFactory(IOptions<KafkaConfiguration> kafkaConfig)
    {
        producer = new ProducerBuilder<string, string>(new ProducerConfig
        {
            BootstrapServers = kafkaConfig.Value.BootstrapServers,
            ClientId = Dns.GetHostName(),
            MessageTimeoutMs = kafkaConfig.Value.ProduceTimeOut
        }).Build();
    }
}