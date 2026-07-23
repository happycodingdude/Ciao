namespace Domain.Entities;

// Tin nhắn đã ghim của MỘT hội thoại — collection top-level `Pin` thay vì cờ IsPinned/PinnedBy
// nhúng trên từng Message sub-doc trong Conversation. Lý do:
//  - Message là phần tử của mảng KHÔNG giới hạn trong Conversation → liệt kê tin ghim phải
//    $unwind toàn bộ history (full scan, không phân trang được).
//  - Tách riêng: "hội thoại A có những tin nhắn đã ghim nào" trở thành query trực tiếp,
//    phân trang server-side theo thời điểm ghim (index (ConversationId, CreatedTime)).
//  - Đồng nhất luồng với Bookmark (tin đã lưu): cùng mô hình collection + resolve nội dung
//    LIVE từ message cache lúc đọc (phản ánh edit/recall mới nhất).
// Pin là dữ liệu DÙNG CHUNG (mọi thành viên thấy) — khác Bookmark (riêng tư per-user).
// Một tin chỉ có tối đa 1 bản ghi (idempotent add) → PinnedBy = người ghim gần nhất (audit + tooltip).
public class Pin : MongoBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string PinnedBy { get; set; } = null!;   // ai ghim (audit + hiển thị "pinned by ...")
}
