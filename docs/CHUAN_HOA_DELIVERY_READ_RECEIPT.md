# Chuẩn hóa delivery/read receipts (Tính năng 1)

## 1. Mục đích

Chuẩn hóa hiển thị trạng thái tin nhắn theo 3 mức **Sent → Delivered → Read** dựa trên horizon-per-member (`Member.LastDeliveredTime`, `Member.LastSeenTime`), thay vì lưu read array trong từng `Message` (vốn làm phình `Conversation.Messages`).

Đảm bảo các đặc tính:

- **Idempotent**: duplicate event hoặc out-of-order event KHÔNG làm lùi state.
- **Monotonic horizon**: `LastDeliveredTime`/`LastSeenTime` chỉ tăng theo thời gian.
- **Read implies delivered**: khi user đọc, ngầm nâng cả delivered horizon (vì đã đọc thì chắc chắn đã nhận).
- **No echo**: notify FCM không gửi về cho chính người vừa thực hiện event.

## 2. Luồng hoạt động

```text
[FE] markDelivered/markRead
   ↓ POST /messages/delivered | /messages/read
[Presentation] DeliveredMessage.Handler | ReadMessage.Handler
   ├─→ Kafka produce (Topic.MessageDelivered | Topic.MessageRead)
   └─→ MemberCache.MemberDelivered | MemberSeenAll  (cache nhanh, idempotent ở app)
   ↓
[Background] DataStoreConsumer
   └─→ Mongo conditional ElemMatch update Members.$.LastDeliveredTime/LastSeenTime
       (idempotent ở DB layer — no-op khi event cũ hơn horizon)
   ↓ Kafka produce (Topic.NotifyMessageDelivered | Topic.NotifyMessageRead)
[Background] NotificationConsumer
   └─→ FCM fan-out (loại sender khỏi recipient list)
```

### Key contract

| Hành vi | Trước | Sau |
|---|---|---|
| `GET /messages` | Side-effect đánh dấu seen | Pure read, không update `LastSeenTime` |
| Duplicate `delivered` event | Set thẳng → có thể lùi state | ElemMatch điều kiện `LastDeliveredTime < new` → no-op |
| Out-of-order `read` event | Set thẳng | Chỉ update khi `readTime > LastSeenTime` |
| User offline lâu rồi `read` | Chỉ update `LastSeenTime` | Update cả `LastDeliveredTime/MessageId` (read implies delivered) |
| FCM notify | Gửi cho TẤT CẢ members | Gửi cho members KHÁC sender |

## 3. Lưu ý khi sử dụng

### Frontend

- Nhận `NewMessage` qua FCM/WebSocket cho tin của người khác → gọi `markDelivered(conversationId, messageId)` (đã có ở `notificationHandlers.ts`).
- User cuộn đến message cuối, tab/app visible → debounce 1000ms rồi gọi `markRead(conversationId, lastMessageId)` (đã có ở `Chatbox.tsx`).
- KHÔNG gửi `delivered`/`read` cho message do chính mình gửi.
- Khi reconnect sau offline: chỉ cần gọi delivered/read cho **last message** đã nhận/đọc — backend dùng horizon để suy ra các message trước đó.
- Nhận FCM event `MessageDelivered` / `MessageRead` (sender side) → cập nhật `members[].lastDeliveredTime/lastSeenTime` trong cache `["conversation"]` qua `updateMemberDeliveredHorizon` / `updateMemberReadHorizon` (idempotent: chỉ nâng forward, no-op khi duplicate/out-of-order; `MessageRead` đồng thời nâng delivered horizon — read implies delivered). UI re-render từ `MessageContent.getReceiptStatus()`:
  - **Direct chat**: `Sent` → `Delivered` → avatar người đã seen.
  - **Group chat**: `Sent` → strip 3 avatar đầu tiên + badge `+N` (nếu nhiều người đã seen).

### Backend

- `MemberSeenAll(time, messageId?)`: idempotent ở app layer (chỉ update khi `time` mới hơn). Truyền `messageId` để cache cập nhật cả `LastDeliveredMessageId`.
- `MemberDelivered(messageId, deliveredTime)`: idempotent tương tự, dùng cho endpoint delivered.
- Mongo update qua `UpdateNoTrackingTime` với filter `ElemMatch` điều kiện thời gian → atomic, no-op tự nhiên cho duplicate.
- Kafka commit ngay cả khi handler lỗi (no-retry) → mọi handler **PHẢI** tự idempotent.

### Edge cases

- Multi-tab/multi-device cùng user gửi delivered/read out-of-order → horizon vẫn monotonic do conditional update.
- Đồng hồ client sai → backend dùng client timestamp làm metadata, nhưng so sánh với horizon hiện có để chỉ update forward; UI có thể hiển thị server-side timestamp nếu cần chính xác.
- User rời group rồi được thêm lại → `LastDeliveredTime/LastSeenTime` của member có thể giữ nguyên (audit) hoặc reset tùy business rule (hiện chưa reset, có thể bổ sung sau).

## 4. Metrics đề xuất (chưa implement)

- `message_receipt_delivered_latency_ms`: từ lúc message tạo tới lúc `delivered` event được persist.
- `message_receipt_read_latency_ms`: tương tự cho `read`.
- `message_receipt_skipped_total`: số event bị Mongo no-op vì timestamp cũ hơn horizon (idempotency hit).
- `fcm_recipients_count`: số recipient mỗi notify để verify đã loại sender.
