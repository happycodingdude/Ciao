# Cập Nhật API Feature Chat 1

## 1. Mục đích
Chuẩn hóa delivery/read receipts dựa trên `Member.LastSeenTime`. Đảm bảo tính minh bạch về việc tin nhắn đã được gửi đến thiết bị (Delivered) và đã được đọc bởi người dùng (Read).

## 2. Luồng hoạt động
- Bỏ cơ chế `SeenAll` khi user gọi GET API danh sách messages. Tránh việc tự động cập nhật read receipt khi prefetch messages.
- Cập nhật API mới để gửi event delivered (`/messages/delivered`) và read (`/messages/read`).
- Dùng Kafka Producer `Topic.MessageDelivered` & `Topic.MessageRead` cho tính đồng bộ hệ thống.
- Cập nhật Consumer logic (`DataStoreConsumer`, `NotificationConsumer`) để đồng bộ Mongo & Firebase Cloud Messaging (FCM).

## 3. Lưu ý khi sử dụng
- Khi frontend (React) nhận được sự kiện `NewMessage` qua WebSocket/FCM, nếu là tin nhắn của người khác gửi đến -> gọi `/messages/delivered` thông qua `markDelivered`.
- Khi người dùng cuộn đến cuối màn hình (biến mất biểu tượng cuộn xuống) -> debounce 1s và gọi `/messages/read` để xác nhận đã xem thông qua `markRead`.
- API gọi bằng axios/fetch qua hàm HttpRequest, không chặn (await) luồng chính.
