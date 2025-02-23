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
                var saveNewMessageModel = JsonConvert.DeserializeObject<SaveNewMessageModel>(data.cr.Message.Value);
                await _kafkaMessageHandler.SaveNewMessage(saveNewMessageModel);
                break;
            case Topic.NotifyNewConversation:
                var notifyNewConversationModel = JsonConvert.DeserializeObject<NotifyNewConversationModel>(data.cr.Message.Value);
                await _kafkaMessageHandler.NotifyNewConversation(notifyNewConversationModel);
                break;
            default:
                break;
        }
    }
}
