# Đề xuất tính năng chat cần bổ sung

## Mục đích

Review codebase ứng dụng chat và đề xuất 2 tính năng chưa có nhưng nên ưu tiên bổ sung để tăng độ tin cậy, khả năng sử dụng và tính đầy đủ của sản phẩm chat.

## Hiện trạng tóm tắt

- Backend có các luồng chính: đăng nhập/đăng ký, bạn bè, direct/group conversation, member, gửi tin nhắn text/media, reply, forward ở frontend, reaction, pin message, search message, upload attachment, notification, presence ping.
- Realtime/async đang dùng Kafka, Redis cache, Firebase notification và có code SignalR/WebRTC, nhưng `app.MapHub<SignalHub>("/ciaohub")` đang bị comment trong `Chat.API/Program.cs`.
- Conversation hiện lưu `Messages` và `Members` trong cùng document MongoDB. Code đã có seen horizon sơ khai bằng `Member.LastSeenTime`, nhưng việc cập nhật đang bị gắn vào API lấy message và chưa có delivered receipt, realtime read receipt rõ ràng hoặc UI receipt đầy đủ.
- Chưa thấy endpoint/model cho edit message, delete message, recall/unsend message hoặc soft delete message.

## Danh sách tính năng

| # | Tính năng | Trạng thái | Chi tiết |
|---|-----------|-----------|---------|
| 1 | Chuẩn hóa delivery/read receipts | ✅ HOÀN THÀNH | [Xem chi tiết](features/TINH_NANG_1_DELIVERY_READ_RECEIPT.md) |
| 2 | Edit, delete và recall message | 🔲 Backlog | [Xem chi tiết](features/TINH_NANG_2_EDIT_DELETE_RECALL.md) |

## Thứ tự ưu tiên

1. **Delivery/read receipts** ✅: tác động lớn tới niềm tin khi chat, tận dụng sẵn `Member.LastSeenTime` và cache member hiện có.
2. **Edit/delete/recall message** 🔲: tác động lớn tới UX, cần schema/event mới nhưng phạm vi rõ ràng.

## Rủi ro cần xử lý trước khi implement

- `Chat.API/Program.cs` đang comment `app.MapHub<SignalHub>("/ciaohub")`; nếu tiếp tục dùng SignalR cho realtime/WebRTC thì cần enable và test lại connection lifecycle.
- `Conversation.Messages` là unbounded array; nếu thêm nhiều metadata vào từng message sẽ làm tăng rủi ro document lớn, query chậm và update array khó. Các tính năng mới nên ưu tiên horizon theo member và soft flag gọn nhẹ.
