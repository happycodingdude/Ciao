namespace SendProcessor.ConsumerHandler;

/// <summary>
/// Description: Lớp này xử lý message từ Kafka
/// </summary>
public class ConsumerResultHanlder
{
    readonly IKafkaMessageHandler _kafkaMessageHandler;

    public ConsumerResultHanlder(IKafkaMessageHandler kafkaMessageHandler)
    {
        _kafkaMessageHandler = kafkaMessageHandler;
    }

    public async Task ExecuteAsync(ConsumerResultData data)
    {
        // Commit message
        data.consumer.Commit(data.cr);

        switch (data.cr.Topic)
        {
            case Topic.SaveNewMessage:
                var message = JsonConvert.DeserializeObject<SaveNewMessageModel>(data.cr.Message.Value);
                await _kafkaMessageHandler.SaveNewMessage(message);
                break;
            default:
                break;
        }
    }
}
