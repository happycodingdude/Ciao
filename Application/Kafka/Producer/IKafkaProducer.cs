namespace Application.Kafka.Producer;

public interface IKafkaProducer
{
    Task ProduceAsync<T>(string topic, T data);
}
