namespace Application.Kafka.Model;

public record ConsumerResultData(ConsumeResult<string, string> cr, IConsumer<string, string> consumer);

public delegate Task ConsumeMessage(ConsumerResultData data);