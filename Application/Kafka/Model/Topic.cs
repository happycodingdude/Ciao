namespace Application.Kafka.Model;

public static class Topic
{
    public const string UserLogin = "user.login";
    public const string UserLogout = "user.logout";
    public const string NewMessage = "message.new";
    public const string StoredMessage = "message.stored";
    public const string NewGroupConversation = "conversation.new";
    public const string StoredGroupConversation = "conversation.stored";
    public const string NewDirectConversation = "direct-conversation.new";
    public const string StoredDirectConversation = "direct-conversation.stored";
    public const string NewMember = "member.new";
    public const string StoredMember = "member.stored";
    public const string NewReaction = "reaction.new";
    public const string StoredReaction = "reaction.stored";
    public const string NotifyNewReaction = "reaction.notify";
    public const string MessageDelivered = "message.delivered";
    public const string MessageRead = "message.read";
    public const string NotifyMessageDelivered = "message.delivered.notify";
    public const string NotifyMessageRead = "message.read.notify";
    public const string MessageEdited = "message.edited";
    public const string MessageRecalled = "message.recalled";
    public const string NotifyMessageEdited = "message.edited.notify";
    public const string NotifyMessageRecalled = "message.recalled.notify";
    // Bình chọn: bỏ phiếu / đóng bình chọn (persist atomic ở DataStoreConsumer).
    public const string PollVote = "poll.vote";
    public const string PollClose = "poll.close";
    // Sau khi persist Mongo → phát tiếp để cập nhật Redis message cache (CacheConsumer).
    public const string StoredPollVote = "poll.vote.stored";
    public const string StoredPollClose = "poll.close.stored";
    // Fanout realtime state bình chọn (voterIds/đóng) tới member (NotificationConsumer → FCM).
    public const string NotifyPoll = "poll.notify";

    // ===== Tùy chỉnh đoạn chat (theme) =====
    // Endpoint chỉ validate + patch Redis + trả response ngay (latency thấp);
    // Mongo persist (theme + system message) ở DataStoreConsumer.
    public const string ConversationAppearanceChanged = "conversation.appearance.changed";
    // Sau khi persist Mongo → fanout FCM tới member khác (NotificationConsumer).
    public const string NotifyConversationAppearanceChanged = "conversation.appearance.notify";

    // ===== Preview Link =====
    // Enqueue khi tin text có URL (DataStoreConsumer). Consumer group RIÊNG (linkpreview-consumer)
    // fetch OG metadata — external I/O chậm, phải cô lập để không chặn pipeline tin nhắn.
    public const string LinkPreviewRequested = "linkpreview.requested";
    // Fetch xong → persist Mongo → phát để CacheConsumer cập nhật Redis message cache.
    public const string StoredLinkPreview = "linkpreview.stored";
    // Fanout realtime thẻ preview tới member (NotificationConsumer → FCM "LinkPreviewReady").
    public const string NotifyLinkPreview = "linkpreview.notify";
}