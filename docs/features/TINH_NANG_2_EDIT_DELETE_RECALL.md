# Tính năng 2: Edit, delete và recall message

> **Trạng thái triển khai: 🔲 CHƯA TRIỂN KHAI — backlog**

## Mục đích

Cho người dùng sửa lỗi nhanh, xóa tin nhắn ở phía mình hoặc thu hồi tin nhắn đã gửi trong một khoảng thời gian cho phép. Đây là kỳ vọng cơ bản của chat app hiện đại.

## Cách hoạt động đề xuất

1. Thêm field vào `Message`:
   - `EditedTime`
   - `DeletedTime`
   - `DeletedBy`
   - `IsRecalled`
   - `RecalledTime`
   - tùy chọn: `DeletedForContactIds` nếu cần "delete for me".
2. Thêm endpoint:
   - `PUT /api/v1/conversations/{conversationId}/messages/{messageId}`
   - `DELETE /api/v1/conversations/{conversationId}/messages/{messageId}`
   - `POST /api/v1/conversations/{conversationId}/messages/{messageId}/recall`
3. Validate:
   - chỉ sender được edit/recall message của mình
   - moderator có thể delete message trong group nếu business rule cho phép
   - chỉ cho edit text message; media message cần rule riêng
   - recall có TTL, ví dụ 5-15 phút
4. Phát event realtime:
   - `MessageEdited`
   - `MessageDeleted`
   - `MessageRecalled`
5. Frontend cập nhật cache React Query theo event, hiển thị label `edited` và placeholder `This message was recalled`.

## Lưu ý khi sử dụng

- Nên soft delete/recall, không hard delete khỏi array ngay, để giữ reply chain, audit, search consistency và tránh race condition với notification đã gửi.
- Cần cập nhật search để bỏ qua recalled/deleted message hoặc hiển thị placeholder tùy UX.
- Cần metric: số lần edit/delete/recall, conflict update count, Kafka duplicate event count, Mongo update latency.

## Rủi ro kỹ thuật

- `Conversation.Messages` là unbounded array; thêm nhiều metadata vào từng message sẽ làm tăng rủi ro document lớn, query chậm và update array khó.
- Nên ưu tiên soft flag gọn nhẹ (`IsRecalled`, `DeletedTime`) thay vì thêm nhiều field phức tạp vào từng message.
- Cần xem xét impact lên reply chain: khi message bị recall, các reply tham chiếu tới nó cần hiển thị placeholder hợp lý.

## Tài liệu liên quan

- [Đề xuất tổng quan](../DE_XUAT_TINH_NANG_CHAT.md)
- [Tính năng 1: Delivery/Read receipts](TINH_NANG_1_DELIVERY_READ_RECEIPT.md)
