namespace Domain.Entities;

// Bookmark (lưu tin nhắn riêng tư) — collection top-level thay vì flag trên Message
// vì Message là sub-doc DÙNG CHUNG trong Conversation, còn bookmark là dữ liệu CÁ NHÂN.
public class Bookmark : MongoBaseModel
{
    public string ContactId { get; set; } = null!;      // chủ sở hữu bookmark
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
}
