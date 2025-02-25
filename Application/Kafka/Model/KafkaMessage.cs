namespace Application.Kafka.Model;

public class KafkaBaseModel
{
    public string UserId { get; set; } = null!;
}

public class NewMessageModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public SendMessageReq Message { get; set; } = null!;
}

public class NewStoredMessageModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public Message Message { get; set; } = null!;
}

public class NewGroupConversationModel : KafkaBaseModel
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public MemberWithContactInfo[] Members { get; set; } = null!;
    // public Conversation conversation { get; set; } = null!;
}

public class NewStoredGroupConversationModel : KafkaBaseModel
{
    public Conversation Conversation { get; set; } = null!;
}

public class NewDirectConversationModel : KafkaBaseModel
{
    public string ContactId { get; set; } = null!;
    public string? Message { get; set; }
}

public class NewStoredDirectConversationModel : KafkaBaseModel
{
    public string ContactId { get; set; } = null!;
    public ConversationCacheModel Conversation { get; set; } = null!;
    public MemberWithContactInfo[] Members { get; set; } = null!;
    public Message? Message { get; set; }
    public bool IsNewConversation { get; set; }
}