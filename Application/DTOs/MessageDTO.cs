namespace Application.DTOs;

public class SendMessageReq
{
    // public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public List<SendMessageReq_Attachment> Attachments { get; set; } = new List<SendMessageReq_Attachment>();
}

public class SendMessageReq_Attachment
{
    public string Type { get; set; } = null!;
    public string MediaName { get; set; } = null!;
    public double MediaSize { get; set; }
    public string MediaUrl { get; set; } = null!;
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

// public class MessageToNotify
// {
//     public string Id { get; set; } = null!;
//     public string Type { get; set; } = null!;
//     public string Content { get; set; } = null!;
//     public ConversationToNotify_Conversation Conversation { get; set; } = null!;
//     public MemberWithContactInfo[] Members { get; set; } = null!;
//     public MessageToNotify_Contact Contact { get; set; } = null!;
//     public List<Attachment> Attachments { get; set; } = new List<Attachment>();
// }

// public class MessageToNotify_Conversation
// {
//     public string Id { get; set; } = null!;
//     public string Title { get; set; } = null!;
//     public string Avatar { get; set; } = null!;
//     public bool IsGroup { get; set; }
//     public string LastMessage { get; set; } = null!;
//     public string LastMessageContact { get; set; } = null!;
//     public List<MemberWithContactInfoAndFriendRequest> Members { get; set; } = null!;
// }

// public class MessageToNotify_Contact
// {
//     public string Id { get; set; } = null!;
//     public string Name { get; set; } = null!;
//     public string Avatar { get; set; } = null!;
// }

public class MessageWithReactions : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string ContactId { get; set; } = null!;
    public List<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
}

public class MessageReactionSumary : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string ContactId { get; set; } = null!;
    public List<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
    public string? CurrentReaction { get; set; }
}

public class MessagesWithHasMore
{
    public bool HasMore { get; set; }
    public List<MessageReactionSumary> Messages { get; set; } = new List<MessageReactionSumary>();
}
