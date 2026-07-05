namespace Domain.Entities;

public class Message : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public bool IsPinned { get; set; }
    public string PinnedBy { get; set; } = null!;
    public bool IsForwarded { get; set; }
    public string? ReplyId { get; set; }
    public string? ReplyContent { get; set; }
    public string? ReplyContact { get; set; }
    public List<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();

    // Chia sẻ danh bạ (Type = contact): thẻ liên hệ đính kèm. Content giữ tên để preview/search.
    // Cùng một type dùng xuyên suốt DTO/Kafka/Event nên AutoMapper map theo tham chiếu, không cần nested map.
    public SharedContact? SharedContact { get; set; }

    // Bình chọn (Type = poll): Content giữ câu hỏi để preview/search. Phiếu bầu lưu theo từng option.
    public Poll? Poll { get; set; }

    // @mention (Option B — có cấu trúc): danh sách userId được tag, sentinel "all" cho @All.
    // Lưu userId (không phải tên) để tạo notification chính xác, tránh báo nhầm khi trùng tên.
    // Doc Mongo cũ thiếu field → default rỗng (no migration).
    public List<string> Mentions { get; set; } = new List<string>();

    // Tính năng 2: edit / recall.
    // Đều dùng soft-flag (timestamp) thay vì hard-delete để giữ reply chain, audit và search consistency.
    public DateTime? EditedTime { get; set; }            // null = chưa từng edit
    public DateTime? RecalledTime { get; set; }          // null = chưa recall (thay cho cờ IsRecalled)
    public string? RecalledByContactId { get; set; }     // sender hoặc moderator thực hiện thu hồi (audit)
}

public class MessageReaction
{
    public string ContactId { get; set; } = null!;
    public string Type { get; set; } = null!;
}

// Thẻ danh bạ được chia sẻ trong tin nhắn (Type = contact).
public class SharedContact
{
    public string ContactId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Avatar { get; set; }
}

// Bình chọn (Type = poll). Câu hỏi lưu ở Message.Content (preview/search).
public class Poll
{
    public string Question { get; set; } = null!;
    public bool AllowMultiple { get; set; }      // cho phép chọn nhiều đáp án
    public DateTime? ClosedTime { get; set; }    // null = còn mở
    public string? ClosedBy { get; set; }        // ai đóng bình chọn (audit)
    public List<PollOption> Options { get; set; } = new List<PollOption>();
}

public class PollOption
{
    // Định danh option do client sinh (ổn định để bỏ phiếu). Đặt tên "Key" (KHÔNG phải "Id")
    // để tránh driver Mongo tự map "Id" → _id gây lệch arrayFilter khi cập nhật phiếu.
    public string Key { get; set; } = null!;
    public string Text { get; set; } = null!;
    public List<string> VoterIds { get; set; } = new List<string>();
}