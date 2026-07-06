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
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public List<NewMessageModel_Message_Attachment> Attachments { get; set; } = new List<NewMessageModel_Message_Attachment>();
    // @mention userIds (sentinel "all"). AutoMapper thread qua SendMessageReq → Message theo tên.
    public List<string> Mentions { get; set; } = new List<string>();
    // Chia sẻ danh bạ: cùng type SharedContact xuyên suốt → AutoMapper map theo tham chiếu.
    public SharedContact? SharedContact { get; set; }
    // Bình chọn: cùng type Poll xuyên suốt → AutoMapper map theo tham chiếu.
    public Poll? Poll { get; set; }
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
    public Message Message { get; set; } = null!;
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
    public NewDirectConversationModel_Conversation Conversation { get; set; } = null!;
    public NewDirectConversationModel_Message? Message { get; set; }
}

public class NewDirectConversationModel_Conversation
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public Member[] Members { get; set; } = null!;
}

public class NewDirectConversationModel_Message : BaseIdModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public bool IsForwarded { get; set; }
}

public class NewStoredDirectConversationModel : NewStoredGroupConversationModel
{
    public string ContactId { get; set; } = null!;
    // public Message? Message { get; set; }
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
    // null/empty = gỡ reaction (unreact) → KHÔNG tạo notification. Có giá trị = thêm/đổi reaction.
    public string? Type { get; set; }
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

public class MessageDeliveredModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime DeliveredTime { get; set; }
}

public class MessageReadModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime ReadTime { get; set; }
}

public class NotifyMessageDeliveredModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime DeliveredTime { get; set; }
}

public class NotifyMessageReadModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime ReadTime { get; set; }
}

// ===== Tính năng 2: edit / recall / delete-for-me =====

public class MessageEditedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime EditedTime { get; set; }
}

public class MessageRecalledModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime RecalledTime { get; set; }
    public string RecalledByContactId { get; set; } = null!;
}

public class NotifyMessageEditedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime EditedTime { get; set; }
}

public class NotifyMessageRecalledModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime RecalledTime { get; set; }
    public string RecalledByContactId { get; set; } = null!;
}

// ===== Bình chọn (poll) =====

public class PollVoteModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string OptionKey { get; set; } = null!;
    // Từ FE: poll cho phép nhiều lựa chọn hay không (quyết định toggle vs độc quyền).
    public bool AllowMultiple { get; set; }
}

public class PollCloseModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
}

// State bình chọn authoritative để fanout realtime + đồng bộ FE.
// UserId = người vừa gây ra thay đổi (vote/close). Options mang voterIds đầy đủ theo cache.
public class NotifyPollModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public List<NotifyPollOption> Options { get; set; } = new();
    public DateTime? ClosedTime { get; set; }
    public string? ClosedBy { get; set; }
}

public class NotifyPollOption
{
    public string Key { get; set; } = null!;
    public List<string> VoterIds { get; set; } = new();
}

// ===== Preview Link =====

// Yêu cầu fetch preview cho 1 tin text có URL. Urls = mọi URL trong nội dung (giữ thứ tự, đã trích
// ở DataStore). Url (cũ) = URL đầu tiên — giữ lại để tin ĐANG NẰM TRONG TOPIC trước khi deploy vẫn
// xử lý được (consumer fallback Url → Urls khi Urls rỗng).
public class LinkPreviewRequestedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string Url { get; set; } = null!;
    public List<string> Urls { get; set; } = new List<string>();
}

// Kết quả preview đã persist — dùng chung cho topic stored (→ cache) và notify (→ FCM fanout).
// LinkPreviews = tất cả thẻ (giữ thứ tự); LinkPreview (cũ) = phần tử đầu (backward-compat).
public class StoredLinkPreviewModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public LinkPreview LinkPreview { get; set; } = null!;
    public List<LinkPreview> LinkPreviews { get; set; } = new List<LinkPreview>();
}