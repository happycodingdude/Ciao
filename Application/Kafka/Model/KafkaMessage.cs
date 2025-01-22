namespace Application.Kafka.Model;

public class KafkaBaseModel
{
    public string UserId { get; set; } = null!;
}

public class SaveNewMessageModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public SendMessageReq Message { get; set; } = null!;
}