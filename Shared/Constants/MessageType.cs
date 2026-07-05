namespace Shared.Constants;

public partial class AppConstants
{
    // ===== Loại tin nhắn (Message.Type) =====
    // Nguồn chân lý duy nhất cho các loại tin, dùng chung ở validator, consumer,
    // preview và mapping để tránh literal rải rác dễ lệch.
    public const string MessageType_Text = "text";       // tin văn bản
    public const string MessageType_Media = "media";      // ảnh/video/file đính kèm
    public const string MessageType_Sticker = "sticker";  // nhãn dán (Content = sticker id)
    public const string MessageType_Gif = "gif";          // GIF (Content = url GIF)
    public const string MessageType_Poll = "poll";        // bình chọn (Content = câu hỏi)
    public const string MessageType_Contact = "contact";  // chia sẻ danh bạ (Content = tên)
    public const string MessageType_System = "system";    // tin hệ thống

    // Nhãn preview hiển thị ở danh sách hội thoại cho các loại tin không phải text.
    public const string MessagePreview_Sticker = "[Nhãn dán]";
    public const string MessagePreview_Gif = "[GIF]";
    public const string MessagePreview_PollPrefix = "[Bình chọn] ";
    public const string MessagePreview_ContactPrefix = "[Danh bạ] ";

    /// <summary>
    /// Xây chuỗi preview lastMessage cho danh sách hội thoại theo loại tin.
    /// Tập trung một chỗ để 3 call site (ConversationCache, MessageCache,
    /// ConversationRepository) luôn nhất quán khi thêm loại tin mới.
    /// </summary>
    public static string BuildLastMessagePreview(string type, string? content, IEnumerable<string> attachmentNames)
    {
        return type switch
        {
            MessageType_Media => string.Join(",", attachmentNames),
            MessageType_Sticker => MessagePreview_Sticker,
            MessageType_Gif => MessagePreview_Gif,
            MessageType_Poll => MessagePreview_PollPrefix + (content ?? string.Empty),
            MessageType_Contact => MessagePreview_ContactPrefix + (content ?? string.Empty),
            _ => content ?? string.Empty, // text / system
        };
    }
}
