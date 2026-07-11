namespace Application.WebSocketEvents;

public class EventNewMessage
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string? Content { get; set; }
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public DateTime CreatedTime { get; set; }
    public EventNewMessage_Conversation Conversation { get; set; } = null!;
    public EventNewConversation_Member[] Members { get; set; } = null!;
    public EventNewMessage_Contact Contact { get; set; } = null!;
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
    // Chia sẻ danh bạ: thẻ liên hệ đính kèm để FE dựng card realtime.
    public SharedContact? SharedContact { get; set; }
    // Bình chọn: FE dựng poll realtime khi có tin bình chọn mới.
    public Poll? Poll { get; set; }
}

public class EventNewMessage_Conversation
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsGroup { get; set; }
    public string LastMessage { get; set; } = null!;
    public string LastMessageContact { get; set; } = null!;
    public DateTime? LastMessageTime { get; set; }
    // public List<MemberWithContactInfoAndFriendRequest> Members { get; set; } = null!;
}

public class EventNewMessage_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
}

public class EventNewConversation
{
    public EventNewMessage_Conversation Conversation { get; set; } = null!;
    public EventNewConversation_Member[] Members { get; set; } = null!;
    public Message? Message { get; set; }
}

public class EventNewConversation_Member
{
    public string Id { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public ContactInfoMoreDetails Contact { get; set; } = null!;
    public DateTime? LastSeenTime { get; set; }
    public bool IsSelected { get; set; }
    public bool IsNew { get; set; }
}

public class EventNewFriendRequest
{
    public string FriendId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    // Tên/avatar người gửi lời mời → để FE dựng banner "X đã gửi lời mời kết bạn"
    // mà không phải lookup thêm (payload cũ chỉ có id ⇒ banner generic).
    public string? ContactName { get; set; }
    public string? ContactAvatar { get; set; }
}

// Payload realtime khi có reaction mới. Gửi cho TẤT CẢ member (đồng bộ count),
// nhưng kèm MessageOwnerId + ReactorName để FE chỉ banner cho CHỦ tin (≠ reactor).
public class EventNewReaction
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    // null/empty = unreact (gỡ) → FE không banner.
    public string? Type { get; set; }
    public string ReactorId { get; set; } = null!;
    public string? ReactorName { get; set; }
    public string? ReactorAvatar { get; set; }
    // Chủ nhân tin bị react — FE so với chính mình để quyết định có banner không.
    public string? MessageOwnerId { get; set; }
    public int LikeCount { get; set; }
    public int LoveCount { get; set; }
    public int CareCount { get; set; }
    public int WowCount { get; set; }
    public int SadCount { get; set; }
    public int AngryCount { get; set; }
}

// Payload realtime khi state bình chọn thay đổi (vote/đóng). Sync-event (data-only, không banner)
// → FE ghi đè voterIds + closedTime/closedBy theo state server (authoritative, idempotent).
public class EventPollUpdated
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public List<EventPollUpdated_Option> Options { get; set; } = new();
    public DateTime? ClosedTime { get; set; }
    public string? ClosedBy { get; set; }
}

public class EventPollUpdated_Option
{
    public string Key { get; set; } = null!;
    public List<string> VoterIds { get; set; } = new();
}

// Payload realtime khi thẻ preview link của 1 tin đã sẵn sàng (fetch async xong).
// Sync-event (data-only, không banner) → FE patch message.linkPreview theo messageId. Idempotent.
public class EventLinkPreviewReady
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    // LinkPreviews = tất cả thẻ (giữ thứ tự); LinkPreview (cũ) = phần tử đầu, giữ cho FE cũ.
    public LinkPreview LinkPreview { get; set; } = null!;
    public List<LinkPreview> LinkPreviews { get; set; } = new List<LinkPreview>();
}

// Phase 3 — biệt danh: sync-event (data-only, không banner) → FE patch nickname của member
// trong cache ["conversation"]. Nickname null/rỗng = xóa biệt danh, quay về tên gốc.
public class EventMemberNicknameChanged
{
    public string ConversationId { get; set; } = null!;
    public string ContactId { get; set; } = null!;      // thành viên được đặt biệt danh
    public string? Nickname { get; set; }
    public string ChangedBy { get; set; } = null!;
}

// Phase 3 — theme chat chung: sync-event (data-only, không banner) → FE patch
// wallpaper/bubbleColor của conversation trong cache ["conversation"]. Null = về mặc định.
public class EventConversationAppearanceChanged
{
    public string ConversationId { get; set; } = null!;
    public string? Wallpaper { get; set; }
    public string? BubbleColor { get; set; }
    public string ChangedBy { get; set; } = null!;
    // Dòng hệ thống "{user} changed the chat theme" đã persist kèm lần đổi này —
    // FE append thẳng vào message cache (id thật, khớp reload, dedupe được).
    public EventSystemMessage? SystemMessage { get; set; }
}

// Payload tin hệ thống gọn cho sync-event (đủ để FE render + dedupe, không kéo cả entity).
public class EventSystemMessage
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public DateTime CreatedTime { get; set; }
}

// Payload realtime khi 1 contact đổi profile (name/avatar/bio). Sync-event (data-only,
// không banner) → FE patch trực tiếp cache ["friend"] + members trong ["conversation"].
public class EventContactUpdated
{
    public string ContactId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public string Bio { get; set; } = null!;
}