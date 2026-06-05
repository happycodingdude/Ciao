# Tính năng 1: Chuẩn hóa delivery/read receipts dựa trên `Member.LastSeenTime`

> **Trạng thái triển khai (cập nhật 2026-06-02): ✅ HOÀN THÀNH (backend + frontend)**
>
> Các thay đổi đã merge:
>
> - `Domain/Entities/Member.cs`: thêm `LastDeliveredMessageId`, `LastDeliveredTime`.
> - `Application/DTOs/MemberDto.cs` (`MemberWithContactInfo`): thêm 2 field tương ứng để cache reflect đầy đủ.
> - `Application/Kafka/Model/Topic.cs`: thêm 4 topic — `MessageDelivered`, `MessageRead`, `NotifyMessageDelivered`, `NotifyMessageRead`.
> - `Application/Kafka/Model/KafkaMessage.cs`: thêm 4 model — `MessageDeliveredModel`, `MessageReadModel`, `NotifyMessageDeliveredModel`, `NotifyMessageReadModel`.
> - `Application/WebSocketEvents/ChatEventNames.cs`: thêm 2 event name `MessageDelivered`, `MessageRead`.
> - `Presentation/Message/DeliveredMessage.cs`: endpoint `POST /api/v1/conversations/{conversationId}/messages/delivered` — produce Kafka + cập nhật cache `MemberCache.MemberDelivered` để UI đa thiết bị reflect ngay.
> - `Presentation/Message/ReadMessage.cs`: endpoint `POST /api/v1/conversations/{conversationId}/messages/read` — produce Kafka + cập nhật cache `MemberCache.MemberSeenAll` (đã hỗ trợ `messageId`).
> - `Presentation/Conversation/GetMessages.cs`: bỏ side-effect đánh dấu seen khi fetch message — fetch không còn ngầm "đã đọc".
> - `Infrastructure/Repositories/ConversationRepository.cs`: bỏ projection `SeenTime` không còn dùng.
> - `Infrastructure/BackgroundJobs/DataStoreConsumer.cs`:
>   - `HandleMessageDelivered`: filter Mongo `ElemMatch` thêm điều kiện `LastDeliveredTime == null OR < DeliveredTime` → **idempotent ở Mongo layer**, no-op tự nhiên khi event duplicate hoặc out-of-order.
>   - `HandleMessageRead`: tách thành 2 update — (1) `LastSeenTime` chỉ tăng monotonic, (2) **read implies delivered**: nâng cả `LastDeliveredTime/LastDeliveredMessageId` nếu null hoặc cũ hơn `ReadTime`. Cả 2 ops cùng `UnitOfWork.SaveAsync` → 1 transaction Mongo.
> - `Application/Caching/MemberCache.cs`:
>   - `MemberSeenAll(conversationId, time, messageId?)`: idempotent ở app layer — chỉ update khi `time` mới hơn `LastSeenTime`; đồng thời sync `LastDeliveredTime/LastDeliveredMessageId` (read implies delivered ở cache).
>   - Mới: `MemberDelivered(conversationId, messageId, deliveredTime)` — cập nhật cache delivered horizon, idempotent.
> - `Application/Caching/MessageCache.cs` (cập nhật 2026-06-02): **bỏ hoàn toàn** fallback `if (m.IsSelected) m.LastSeenTime = now;` khi nhận message mới. Read horizon giờ chỉ được nâng qua explicit event từ FE (`markRead` debounced ở `Chatbox.tsx`). Lý do: IsSelected có thể stale, và việc tự đánh dấu seen từ implicit signal làm sai semantic "đã đọc".
> - `Infrastructure/BackgroundJobs/NotificationConsumer.cs`:
>   - `HandleNotifyMessageDelivered/Read`: lọc bỏ `param.ContactId` (chính người vừa thực hiện) khỏi recipient FCM → tiết kiệm cost, tránh echo loop multi-tab. Dùng `ChatEventNames.MessageDelivered/Read` thay vì hardcode string.
> - Frontend (`client/src/services/message.service.ts`): `markDelivered`, `markRead` đã có; được gọi từ `Chatbox.tsx` (read khi user xem message cuối) và `notificationHandlers.ts` (delivered khi nhận `NewMessage` qua FCM).
> - Frontend (`client/src/utils/notificationHandlers.ts`) (cập nhật 2026-06-02): subscribe 2 event FCM `MessageDelivered` / `MessageRead` → cập nhật `members[].lastDeliveredTime/lastSeenTime` trong cache `["conversation"]`. Sender re-render trạng thái Sent → Delivered → Seen tự động (UI ở `MessageContent.getReceiptStatus()` đã có sẵn render: avatar người đã seen cho direct chat, "Seen by + N" cho group).
> - Frontend (`client/src/utils/notificationCacheHelpers.ts`) (cập nhật 2026-06-02): thêm 2 helper `updateMemberDeliveredHorizon` / `updateMemberReadHorizon` — idempotent ở cache layer (chỉ nâng forward, no-op khi duplicate/out-of-order; preserve reference khi không đổi → tránh re-render thừa). Read implies delivered: helper read tự nâng cả delivered horizon nếu cũ hơn.
> - Frontend (`client/src/types/notification.types.ts`) (cập nhật 2026-06-02): thêm types `MessageDeliveredEvent`, `MessageReadEvent` match với BE payload.
>
> **Không còn item open cho tính năng 1.** Các nâng cấp tiếp theo (metrics, observability, group "Seen by" panel chi tiết khi click) thuộc backlog tăng cường, không block tính năng.

## Mục đích

Cho người gửi biết tin đã gửi, đã đến thiết bị người nhận và đã được đọc, nhưng không thay thế hoàn toàn cơ chế hiện có. Tính năng này nên nâng cấp `Member.LastSeenTime` hiện tại thành một read horizon đúng nghĩa, đồng thời bổ sung delivered horizon.

## Bài toán cần giải quyết

Hiện tại hệ thống không lưu seen status trong từng `Message`. Seen status đang nằm ở cấp member qua `Member.LastSeenTime`, được cập nhật trong `GetMessages.SeenAll()` và `MemberCache.MemberSeenAll()`. Hướng lưu này là hợp lý hơn per-message read array vì tránh làm phình document `Conversation.Messages`.

Vấn đề không nằm ở chỗ "chưa có seen", mà nằm ở 4 điểm:

- Không phân biệt được "message đã đến thiết bị" và "message đã được đọc".
- API `GET /conversations/{id}/messages` đang có side-effect đánh dấu seen, nên frontend prefetch/refetch message cũng có thể làm hệ thống hiểu nhầm là user đã đọc.
- Chưa có event realtime `MessageRead` để đồng bộ trạng thái đã đọc cho người gửi.
- Người gửi chưa có feedback rõ ràng: tin mới chỉ gửi thành công lên server, đã đến người nhận hay đã được người nhận xem.

Tính năng này nên chuyển trạng thái tin nhắn thành một luồng rõ ràng:

1. `Sent`: người gửi gửi thành công lên backend.
2. `Delivered`: tin đã được đẩy tới client/người nhận hoặc thiết bị người nhận đã xác nhận nhận được.
3. `Read`: người nhận thực sự mở conversation và nhìn thấy tin nhắn. Trạng thái này có thể tiếp tục suy ra từ `Member.LastSeenTime`.

## Cách hoạt động đề xuất

1. Tách hành vi "đọc tin" khỏi API `GET /conversations/{id}/messages`; không nên đánh dấu đã đọc chỉ vì frontend fetch/prefetch.
2. Thêm endpoint rõ ràng:
   - `POST /api/v1/conversations/{conversationId}/messages/delivered`
   - `POST /api/v1/conversations/{conversationId}/messages/read`
3. Tiếp tục lưu read horizon theo member thay vì ghi status vào từng message:
   - `Member.LastDeliveredTime`
   - dùng lại `Member.LastSeenTime` làm read horizon, hoặc đổi tên dần thành `LastReadTime` nếu muốn semantic rõ hơn.
4. Phát event realtime cho các thành viên:
   - `MessageDelivered`
   - `MessageRead`
5. Frontend render:
   - direct chat: `Sent`, `Delivered`, `Seen`
   - group chat: danh sách "Seen by..." tối thiểu cho tin gần nhất hoặc panel chi tiết.

## Luồng hoạt động chi tiết

### 1. Khi gửi tin nhắn

Frontend gọi API gửi message hiện có:

```http
POST /api/v1/conversations/{conversationId}/messages
```

Backend tạo message, publish Kafka topic `message.new`, sau đó lưu vào MongoDB và cập nhật cache như hiện tại. Khi API trả về `messageId`, frontend có thể hiển thị trạng thái `Sent`.

Trạng thái `Sent` chỉ có nghĩa là backend đã nhận và xử lý request gửi tin. Nó chưa đảm bảo người nhận online hoặc đã nhận được tin.

### 2. Khi người nhận nhận được tin

Khi client nhận event `NewMessage` qua Firebase/SignalR hoặc fetch được message mới khi reconnect, frontend gửi xác nhận delivered:

```http
POST /api/v1/conversations/{conversationId}/messages/delivered
```

Request body đề xuất:

```json
{
  "messageId": "message-id-cuoi-cung-da-nhan",
  "deliveredTime": "2026-06-01T08:30:00Z"
}
```

Backend cập nhật horizon theo member:

```csharp
Member.LastDeliveredMessageId
Member.LastDeliveredTime
```

Không cần update từng message. Với mỗi message, có thể suy ra đã delivered cho user A nếu:

```text
message.CreatedTime <= member.LastDeliveredTime
```

Sau khi cập nhật, backend phát event realtime:

```text
MessageDelivered
```

Event payload đề xuất:

```json
{
  "conversationId": "conversation-id",
  "contactId": "nguoi-da-nhan",
  "messageId": "message-id-cuoi-cung-da-nhan",
  "deliveredTime": "2026-06-01T08:30:00Z"
}
```

### 3. Khi người nhận thật sự đọc tin

Khi user đang mở conversation, tab/app đang active và message list đã render tới cuối vùng nhìn thấy, frontend gửi read receipt:

```http
POST /api/v1/conversations/{conversationId}/messages/read
```

Request body đề xuất:

```json
{
  "messageId": "message-id-cuoi-cung-da-doc",
  "readTime": "2026-06-01T08:31:00Z"
}
```

Backend cập nhật:

```csharp
Member.LastSeenTime
```

Không bắt buộc phải thêm `LastReadTime` ngay vì codebase đã có `LastSeenTime`. Điều quan trọng là đổi nơi cập nhật: không cập nhật trong API lấy message nữa, mà chỉ cập nhật khi frontend xác nhận user đang thật sự đọc conversation. Nếu muốn rõ semantic hơn về sau, có thể migrate `LastSeenTime` thành `LastReadTime`.

Sau khi cập nhật, backend phát event:

```text
MessageRead
```

Event payload đề xuất:

```json
{
  "conversationId": "conversation-id",
  "contactId": "nguoi-da-doc",
  "messageId": "message-id-cuoi-cung-da-doc",
  "readTime": "2026-06-01T08:31:00Z"
}
```

## Data model đề xuất

Nên mở rộng `Member` thay vì thêm array status vào từng `Message`.

```csharp
public class Member : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; } = null!;

    public DateTime? LastSeenTime { get; set; } // Read horizon hiện có, nên tiếp tục dùng ở giai đoạn đầu.
    public string? LastDeliveredMessageId { get; set; }
    public DateTime? LastDeliveredTime { get; set; }
}
```

Lý do chọn horizon theo member:

- Một conversation có thể có rất nhiều message; nếu mỗi message chứa danh sách user đã đọc thì document sẽ tăng rất nhanh.
- Với group chat, số lượng member càng lớn thì per-message read array càng tốn storage và update càng nặng.
- Horizon theo member đã đúng với hướng hiện tại của codebase: biết message nào đã được từng người nhận/đọc dựa trên `LastSeenTime`, timestamp hoặc message order.

## Backend cần bổ sung

### Endpoint delivered

```http
POST /api/v1/conversations/{conversationId}/messages/delivered
```

Validation:

- User hiện tại phải là member của conversation.
- `messageId` phải tồn tại trong conversation.
- Message không được là message của chính user hiện tại nếu chỉ tracking người nhận.
- Nếu `deliveredTime` cũ hơn `LastDeliveredTime` hiện có thì bỏ qua để idempotent.

### Endpoint read

```http
POST /api/v1/conversations/{conversationId}/messages/read
```

Validation:

- User hiện tại phải là member của conversation.
- `messageId` phải tồn tại trong conversation.
- Chỉ update nếu `readTime` mới hơn `LastSeenTime`.
- Nếu `LastDeliveredTime` chưa có hoặc nhỏ hơn `readTime`, có thể cập nhật cả delivered horizon vì đã đọc thì chắc chắn đã nhận.

### Kafka topic/event đề xuất

Có thể thêm topic mới:

```csharp
public const string MessageDelivered = "message.delivered";
public const string MessageRead = "message.read";
public const string NotifyMessageDelivered = "message.delivered.notify";
public const string NotifyMessageRead = "message.read.notify";
```

Luồng xử lý nên theo pattern hiện tại:

```text
API -> Kafka -> DataStoreConsumer update Mongo -> CacheConsumer update Redis -> NotificationConsumer/WebSocket notify clients
```

Nếu muốn đơn giản ở giai đoạn đầu, endpoint có thể update Mongo/Redis trực tiếp rồi phát notify. Tuy nhiên về lâu dài nên đi theo Kafka để đồng nhất với luồng `NewMessage`, `NewReaction`, `PinMessage`.

## Những chỗ code hiện tại cần đổi

- `Presentation/Conversation/GetMessages.cs`: bỏ side-effect `SeenAll(request.id, lastSeenTime, userId)` khỏi handler lấy message. API đọc dữ liệu không nên tự đánh dấu đã đọc.
- `Application/Caching/MemberCache.cs`: tách `MemberSeenAll()` thành hàm update read horizon rõ nghĩa, ví dụ `UpdateLastSeenTime()` hoặc `MarkConversationRead()`.
- `Application/Caching/MessageCache.cs`: đoạn update `m.LastSeenTime = now` khi member đang `IsSelected` có thể giữ tạm để tránh unread sai, nhưng về lâu dài nên thay bằng event read explicit từ frontend để tránh phụ thuộc vào trạng thái `IsSelected` trong cache.
- `Infrastructure/Repositories/ConversationRepository.cs`: projection `"SeenTime", "$$message.SeenTime"` không còn phù hợp vì `Message` không có `SeenTime`; nên bỏ để tránh hiểu nhầm rằng hệ thống đang lưu seen trong từng message.

## Frontend cần bổ sung

### Khi nào gửi delivered

Frontend gửi delivered khi:

- Nhận `NewMessage` trong conversation mà user là receiver.
- App reconnect và fetch được message mới chưa delivered.
- Không gửi delivered cho message do chính mình gửi.

### Khi nào gửi read

Frontend chỉ gửi read khi đủ điều kiện:

- Conversation đang active.
- Tab/app đang visible.
- Message cuối cùng của người khác đã được render hoặc nằm trong viewport.
- Không gửi liên tục từng message; debounce/throttle theo conversation, ví dụ 500-1000ms.

### UI đề xuất

Direct chat:

- Message của mình vừa gửi: `Sent`.
- Khi người nhận confirmed delivered: `Delivered`.
- Khi người nhận read: `Seen`.
- Có thể hiển thị avatar nhỏ của người đã seen dưới message cuối.

Group chat:

- Không nên hiển thị quá nhiều text dưới mỗi message.
- Với message gần nhất của mình, hiển thị `Seen by A, B`.
- Nếu nhiều người đã seen, hiển thị `Seen by A, B + 5`.
- Click/mở panel chi tiết để xem danh sách delivered/read.

## Edge cases cần xử lý

- User offline nhiều ngày rồi mở app lại: frontend chỉ gửi delivered/read cho message cuối cùng đã nhận/đọc, backend dùng horizon để suy ra các message trước đó.
- User mở nhiều tab/thiết bị: chỉ update nếu timestamp mới hơn; event duplicate phải không làm sai trạng thái.
- User rời group rồi được thêm lại: read/delivered horizon cần reset hoặc giữ theo rule rõ ràng.
- Tin nhắn bị recall/delete sau này: read receipt vẫn có thể giữ audit, nhưng UI không cần hiển thị chi tiết cho message đã recall.
- Đồng hồ client sai: backend nên ưu tiên server time khi update, hoặc chỉ dùng client timestamp như metadata tham khảo.

## Metrics và logging cần có

- `message_receipt_delivered_latency_ms`: thời gian từ lúc message được tạo tới lúc delivered.
- `message_receipt_read_latency_ms`: thời gian từ lúc message được tạo tới lúc read.
- `message_receipt_duplicate_total`: số event duplicate bị bỏ qua.
- `message_receipt_update_duration_ms`: thời gian update Mongo/Redis.
- Log theo `conversationId`, `messageId`, `contactId`, `receiptType`, không log content message.

## Tiêu chí nghiệm thu

- Gửi tin direct chat thành công thì người gửi thấy `Sent`.
- Khi người nhận online và nhận event, người gửi thấy `Delivered`.
- Khi người nhận mở conversation, người gửi thấy `Seen`.
- Fetch/prefetch message khi conversation không active không làm message bị đánh dấu read, vì `GET /messages` không còn update `LastSeenTime`.
- Group chat hiển thị được danh sách người đã seen cho message gần nhất.
- Gửi duplicate delivered/read request không tạo lỗi và không làm lùi trạng thái.
- Reconnect sau khi offline vẫn cập nhật đúng delivered/read horizon.

## Lưu ý khi sử dụng

- Không nên chuyển sang lưu array read status trong mỗi message vì document `Conversation.Messages` đã là array tăng trưởng; hướng hiện tại dùng member horizon là đúng, chỉ cần chuẩn hóa lại semantic và luồng cập nhật.
- Cần idempotent: client có thể gửi read event nhiều lần, backend chỉ update nếu timestamp mới hơn.
- Cần metric: latency event read/delivered, Redis hit rate, Mongo update time, số event duplicate bị skip.

## Tài liệu liên quan

- [API Changes](../api-changes/CHUAN_HOA_DELIVERY_READ_RECEIPT_API_CHANGES.md)
- [Triển khai thực tế](CHUAN_HOA_DELIVERY_READ_RECEIPT.md)
- [Cập nhật hiển thị seen avatar](CAP_NHAT_HIEN_THI_SEEN_AVATAR.md)
- [Tính năng hiển thị người xem tin nhắn](TINH_NANG_HIEN_THI_NGUOI_XEM_TIN_NHAN.md)
