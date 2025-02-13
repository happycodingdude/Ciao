namespace Application.DTOs;

public class SendMessageReq : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
}

// public class SendMessageReq_Attachments
// {
//     public string Type { get; set; } = null!;
//     public string MediaName { get; set; } = null!;
//     public double MediaSize { get; set; }
//     public string MediaUrl { get; set; } = null!;
// }

public class SendMessageRes
{
    public string Message { get; set; } = null!;
    public string[] Attachments { get; set; } = null!;
}

public class MessageToNotify
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public ConversationToNotify Conversation { get; set; } = null!;
    public MessageToNotify_Contact Contact { get; set; } = null!;
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
}

// public class MessageToNotify_Conversation
// {
//     public string Id { get; set; } = null!;
//     public bool IsGroup { get; set; }
//     public string Title { get; set; } = null!;
//     public string Avatar { get; set; } = null!;
//     // public string LastMessage { get; set; } = null!;
//     // public string LastMessageContact { get; set; } = null!;
// }

public class MessageToNotify_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
}

public class MessagesWithHasMore
{
    public bool HasMore { get; set; }
    public List<MessageWithReactions> Messages { get; set; } = new List<MessageWithReactions>();
}

public class MessageWithReactions : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Status { get; set; } = null!;
    public bool IsPinned { get; set; }
    public DateTime? SeenTime { get; set; }
    public string ContactId { get; set; } = null!;
    public List<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string CurrentReaction { get; set; } = null!;
}