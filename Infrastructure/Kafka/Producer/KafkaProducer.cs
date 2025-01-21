namespace Infrastructure.Kafka.Producer;

/// <summary>
/// Description: Lớp này triển khai hàm đã khai báo ở IKafkaProducer
/// </summary>
public class KafkaProducer : IKafkaProducer
{
    readonly ProducerFactory _producerFactory;

    public KafkaProducer(ProducerFactory producerFactory)
    {
        _producerFactory = producerFactory;
    }

    public async Task ProduceAsync<T>(string topic, T data)
    {
        try
        {
            await _producerFactory.producer.ProduceAsync(topic, new Message<string, string>
            {
                Key = Guid.NewGuid().ToString(),
                Value = JsonConvert.SerializeObject(data)
            });
        }
        catch (ProduceException<Null, string> ex)
        {
            Console.WriteLine($"Error producing message: {ex.Error.Reason}");
        }
    }
}