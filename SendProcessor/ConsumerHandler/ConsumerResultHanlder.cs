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
                var NewMessageModel = JsonConvert.DeserializeObject<NewMessageModel>(data.cr.Message.Value);
                await _kafkaMessageHandler.SaveNewMessage(NewMessageModel);
                break;
            case Topic.NotifyNewConversation:
                var NewGroupConversationModel = JsonConvert.DeserializeObject<NewGroupConversationModel>(data.cr.Message.Value);
                await _kafkaMessageHandler.NotifyNewConversation(NewGroupConversationModel);
                break;
            default:
                break;
        }
    }
}
