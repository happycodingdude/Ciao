namespace Application.Kafka.Model;

public class KafkaBaseModel
{
    public string UserId { get; set; } = null!;
}

public class UserLoginModel : KafkaBaseModel
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiryDate { get; set; }
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
    public bool IsNew { get; set; }
}

public class NewStoredGroupConversationModel : KafkaBaseModel
{
    public NewStoredGroupConversationModel_Conversation Conversation { get; set; } = null!;
    public NewGroupConversationModel_Member[] Members { get; set; } = null!;
    // public Member[] Members { get; set; } = null!;
}

public class NewStoredGroupConversationModel_Conversation : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
}

// public class NewStoredGroupConversationModel_Member
// {
//     public string Id { get; set; } = null!;
//     public bool IsDeleted { get; set; }
//     public bool IsModerator { get; set; }
//     public bool IsNotifying { get; set; }
//     public string ContactId { get; set; } = null!;
//     public DateTime? LastSeenTime { get; set; }
//     public bool IsAdded { get; set; }
// }

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

public class NewReactionModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string? Type { get; set; }
}

public class NotifyNewReactionModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
}

public class NotifyNewMessagePinnedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string PinnedBy { get; set; } = null!;
}