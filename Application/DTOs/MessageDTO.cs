namespace Application.DTOs;

public class SendMessageReq
{
    [Required]
    [RegularExpression("^(text|image)$", ErrorMessage = "Type must be either 'text' or 'image'.")]
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsForwarded { get; set; }
    public List<SendMessageReq_Attachment> Attachments { get; set; } = new List<SendMessageReq_Attachment>();
}

public class SendMessageReq_Attachment
{
    public string Type { get; set; } = null!;
    public string MediaName { get; set; } = null!;
    public double MediaSize { get; set; }
    public string MediaUrl { get; set; } = null!;
}

public class SendMessageRes
{
    public string MessageId { get; set; } = null!;
    public string[] Attachments { get; set; } = null!;
}

public class MessageReactionSummary : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string PinnedBy { get; set; } = null!;
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public List<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string? CurrentReaction { get; set; }
}

public class MessageWithReactions : MessageReactionSummary
{
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
}

public class MessagesWithHasMore
{
    public bool HasMore { get; set; }
    public List<MessageReactionSummary> Messages { get; set; } = new List<MessageReactionSummary>();
}

public class SystemMessage
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;

    public SystemMessage(string content)
    {
        Type = "system";
        Content = content;
        ContactId = "system";
    }
}