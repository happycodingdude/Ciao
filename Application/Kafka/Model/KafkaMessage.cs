namespace Application.Kafka.Model;

public class KafkaBaseModel
{
    public string UserId { get; set; } = null!;
}

public class NewMessageModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public NewMessageModel_Message Message { get; set; } = null!;
}

public class NewMessageModel_Message : BaseIdModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public List<NewMessageModel_Message_Attachment> Attachments { get; set; } = new List<NewMessageModel_Message_Attachment>();
}

public class NewMessageModel_Message_Attachment : BaseIdModel
{
    public string Type { get; set; } = null!;
    public string MediaName { get; set; } = null!;
    public double MediaSize { get; set; }
    public string MediaUrl { get; set; } = null!;
}

public class NewStoredMessageModel : KafkaBaseModel
{
    // public string ConversationId { get; set; } = null!;
    public NewStoredGroupConversationModel_Conversation Conversation { get; set; } = null!;
    public Member[] Members { get; set; } = null!;
    public Message Message { get; set; } = null!;
}

public class NewGroupConversationModel : KafkaBaseModel
{
    public NewGroupConversationModel_Conversation Conversation { get; set; } = null!;
    public NewGroupConversationModel_Member[] Members { get; set; } = null!;
}

public class NewGroupConversationModel_Conversation
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
}

public class NewGroupConversationModel_Member
{
    public string Id { get; set; } = null!;
    public string ContactId { get; set; } = null!;
}

public class NewStoredGroupConversationModel : KafkaBaseModel
{
    public NewStoredGroupConversationModel_Conversation Conversation { get; set; } = null!;
    public Member[] Members { get; set; } = null!;
}

public class NewStoredGroupConversationModel_Conversation : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
}

public class NewDirectConversationModel : KafkaBaseModel
{
    public string ContactId { get; set; } = null!;
    public bool IsNewConversation { get; set; }
    public NewGroupConversationModel_Conversation Conversation { get; set; } = null!;
    public NewDirectConversationModel_Message? Message { get; set; }
}

public class NewDirectConversationModel_Message : BaseIdModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class NewStoredDirectConversationModel : NewStoredGroupConversationModel
{
    public string ContactId { get; set; } = null!;
    public Message? Message { get; set; }
    public bool IsNewConversation { get; set; }
}

public class NewMemberModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string[] Members { get; set; } = null!;
}

// public class NewStoredMemberModel : KafkaBaseModel
// {
//     public string ConversationId { get; set; } = null!;
//     public Member[] Members { get; set; } = null!;
// }