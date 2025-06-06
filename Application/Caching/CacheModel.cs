namespace Application.Caching;

public class ConversationCacheModel : MongoBaseModel
{
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    // public DateTime? DeletedTime { get; set; }
    // public List<ParticipantWithFriendRequestAndContactInfo> Participants { get; set; } = null!;
    // public int UnSeenMessages { get; set; }
    public string LastMessageId { get; set; } = null!;
    public string LastMessage { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    public string LastMessageContact { get; set; } = null!;
    // public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
}

// public class ListConversationCacheModel
// {
//     public string Id { get; set; } = null!;
//     public int UnSeenMessages { get; set; }
// }

[BsonIgnoreExtraElements]
public class FriendCacheModel
{
    public ContactInfo Contact { get; set; } = null!;
    // public string ContactId { get; set; } = null!;
    public string? FriendId { get; set; }
    public string FriendStatus { get; set; } = null!;
}