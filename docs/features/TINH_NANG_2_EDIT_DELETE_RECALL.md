# Tính năng 2: Edit và recall message

> **Trạng thái triển khai: ✅ HOÀN THÀNH (backend + frontend)**
>
> Doc này bám sát codebase thực tế (Domain entities, Kafka topics, `ChatEventNames`, `MessageCache`, `SearchMessages` pipeline, frontend service) và tuân theo đúng pattern đã thiết lập ở [Tính năng 1](TINH_NANG_1_DELIVERY_READ_RECEIPT.md).
>
> Phạm vi: chỉ gồm **edit** và **recall** (delete-for-everyone). Delete-for-me **không** nằm trong phạm vi tính năng này.
>
> Các thay đổi đã merge:
>
> **Backend**
> - `Domain/Entities/Message.cs`: thêm `EditedTime`, `RecalledTime`, `RecalledByContactId`.
> - `Application/DTOs/MessageDTO.cs` (`MessageReactionSummary`): thêm field tương ứng để cache + FE phản chiếu.
> - `Application/Kafka/Model/Topic.cs`: thêm `MessageEdited`, `MessageRecalled`, `NotifyMessageEdited`, `NotifyMessageRecalled`.
> - `Application/Kafka/Model/KafkaMessage.cs`: thêm 4 model tương ứng.
> - `Application/WebSocketEvents/ChatEventNames.cs`: thêm `MessageEdited`, `MessageRecalled`.
> - `Application/Configurations/MessageActionsOptions.cs` (mới): TTL configurable (`EditTtlMinutes`/`RecallTtlMinutes`), bind từ section `MessageActions` trong appsettings, enforce server-side.
> - `Shared/Constants/SystemMessage.cs`: thêm placeholder `Message_Recalled`.
> - `Presentation/Message/EditMessage.cs` (`PUT /{conversationId}/messages/{messageId}`), `RecallMessage.cs` (`POST .../recall`) — validator enforce sender/moderator/TTL/not-recalled, produce Kafka + cập nhật cache tại API call.
> - `Application/Caching/MessageCache.cs`: thêm `UpdateEdited`, `UpdateRecalled` + đồng bộ `ConversationCache.LastMessage` placeholder khi recall/edit tin cuối.
> - `Infrastructure/BackgroundJobs/DataStoreConsumer.cs`: `HandleMessageEdited` (idempotent theo `EditedTime`), `HandleMessageRecalled` (transaction: set recalled + clear Content/Attachments + unpin + overwrite `ReplyContent` của reply chain).
> - `Infrastructure/BackgroundJobs/NotificationConsumer.cs`: `HandleNotifyMessageEdited`/`HandleNotifyMessageRecalled` fanout (loại người thực hiện).
> - `Infrastructure/BackgroundJobs/KafkaBackground.cs`: subscribe topic mới ở `datastore-consumer` + `notification-consumer`.
> - `Infrastructure/Repositories/ConversationRepository.cs` + `SearchMessages`: pipeline loại `RecalledTime != null`.
>
> **Frontend**
> - `client/src/services/message.service.ts`: `editMessage`, `recallMessage`.
> - `client/src/hooks/useMessageActions.ts` (mới): `useMessageEdit` (shared edit state) + `useMessageActions` (edit optimistic, recall chờ server).
> - `client/src/utils/notificationCacheHelpers.ts`: `updateMessageEdited`, `updateMessageRecalled` (idempotent forward-only).
> - `client/src/utils/notificationHandlers.ts`: subscribe `MessageEdited`, `MessageRecalled`.
> - `client/src/types/message.types.ts` + `notification.types.ts`: thêm field message + event types.
> - UI: label `(edited)`, placeholder "Tin nhắn đã được thu hồi", action menu (`MessageMenu_Slide`) + edit mode trong `ChatInput`.

## Mục đích

Cho người dùng sửa lỗi nhanh (edit) hoặc thu hồi tin nhắn đã gửi cho mọi người trong một khoảng thời gian cho phép (recall / delete-for-everyone). Đây là kỳ vọng cơ bản của chat app hiện đại.

## 1. Phân tách rõ 2 hành vi

Đây là 2 hành vi khác nhau về quyền và phạm vi ảnh hưởng. Không được gộp chung.

| Hành vi | Ai làm | Phạm vi ảnh hưởng | TTL | Endpoint |
|---|---|---|---|---|
| **Edit** | Sender | Mọi người trong conversation | Có (configurable, mặc định 15 phút) | `PUT /api/v1/conversations/{conversationId}/messages/{messageId}` |
| **Recall** (delete-for-everyone) | Sender (hoặc moderator trong group) | Mọi người trong conversation | Có (configurable, mặc định 15 phút) | `POST /api/v1/conversations/{conversationId}/messages/{messageId}/recall` |

## 2. Schema fields

Bám theo naming convention của codebase: suffix `Time` cho timestamp (giống `LastSeenTime`, `LastDeliveredTime`), suffix `ByContactId` cho người thực hiện (giống `PinnedBy`, `LastMessageContact` đang lưu userId dạng string).

```csharp
// Domain/Entities/Message.cs
public class Message : MongoBaseModel
{
    // ... existing fields (Type, Content, ContactId, IsPinned, PinnedBy,
    //     IsForwarded, ReplyId, ReplyContent, ReplyContact, Reactions, Attachments) ...

    public DateTime? EditedTime { get; set; }           // null = chưa từng edit
    public DateTime? RecalledTime { get; set; }         // null = chưa recall
    public string? RecalledByContactId { get; set; }    // sender hoặc moderator
}
```

Lý do thiết kế:

- **Bỏ `IsRecalled`** — dư thừa với `RecalledTime` (null = chưa recall). Pattern giống cách tính năng 1 dùng `LastDeliveredTime == null` thay vì thêm cờ boolean.
- **Thêm `RecalledByContactId`** — cần cho audit khi moderator group thu hồi message của member khác (không phải lúc nào người recall cũng là sender).
- **Edit chọn overwrite, không lưu history** — `Message.Content` bị ghi đè trực tiếp, chỉ set `EditedTime`. Ưu tiên giảm phình document (`Conversation.Messages` là unbounded array). FE chỉ hiển thị label `edited`, không hỗ trợ "xem bản gốc" ở giai đoạn đầu.

## 3. Kafka topics & WebSocket events

Tuân theo pattern tính năng 1: mỗi action ảnh hưởng nhiều người có **2 topic** (1 cho data store consumer, 1 cho notification consumer).

```csharp
// Application/Kafka/Model/Topic.cs
public const string MessageEdited          = "message.edited";
public const string MessageRecalled        = "message.recalled";
public const string NotifyMessageEdited    = "message.edited.notify";
public const string NotifyMessageRecalled  = "message.recalled.notify";
```

```csharp
// Application/WebSocketEvents/ChatEventNames.cs
public const string MessageEdited   = "MessageEdited";
public const string MessageRecalled = "MessageRecalled";
```

Các Kafka model cần thêm vào `Application/Kafka/Model/KafkaMessage.cs` (kế thừa `KafkaBaseModel` để có `UserId`):

```csharp
public class MessageEditedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime EditedTime { get; set; }
}

public class MessageRecalledModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime RecalledTime { get; set; }
}

public class NotifyMessageEditedModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime EditedTime { get; set; }
}

public class NotifyMessageRecalledModel : KafkaBaseModel
{
    public string ConversationId { get; set; } = null!;
    public string MessageId { get; set; } = null!;
    public DateTime RecalledTime { get; set; }
    public string RecalledByContactId { get; set; } = null!;
}
```

Luồng xử lý (giống `NewMessage`, `MessageDelivered`):

```text
API -> Kafka -> DataStoreConsumer update Mongo
            -> CacheConsumer / MessageCache update Redis
            -> NotificationConsumer fanout FCM (loại bỏ chính người vừa thực hiện khỏi recipient)
```

## 4. Luồng hoạt động chi tiết

### 4.1. Edit

```http
PUT /api/v1/conversations/{conversationId}/messages/{messageId}
```

Request body:

```json
{ "content": "nội dung đã sửa" }
```

Backend:

1. Validate: user là member, là sender của message, message là `type == "text"`, còn trong TTL edit, message chưa bị recall.
2. Produce `Topic.MessageEdited`.
3. Cập nhật `MessageCache.UpdateEdited` ngay tại API call (multi-device của sender reflect nhanh — pattern giống `DeliveredMessage` cập nhật cache tại handler).
4. `DataStoreConsumer.HandleMessageEdited`: Mongo update array filter set `Content` + `EditedTime` (idempotent: chỉ apply nếu `EditedTime` mới hơn giá trị hiện có).
5. `NotificationConsumer.HandleNotifyMessageEdited`: fanout event `MessageEdited` tới các member khác (loại bỏ sender).

### 4.2. Recall (delete-for-everyone)

```http
POST /api/v1/conversations/{conversationId}/messages/{messageId}/recall
```

Backend:

1. Validate: user là member; là sender của message **hoặc** moderator của group; còn trong TTL recall; message chưa bị recall trước đó.
2. Produce `Topic.MessageRecalled`.
3. Cập nhật `MessageCache.UpdateRecalled` + `ConversationCache.LastMessage` (xem Cache impact) + auto-unpin nếu đang pinned.
4. `DataStoreConsumer.HandleMessageRecalled`: trong **1 transaction Mongo**:
   - set `RecalledTime` + `RecalledByContactId` cho message (idempotent: chỉ khi `RecalledTime == null`),
   - clear `Content` về empty + clear `Attachments` (tránh leak nội dung/file đã thu hồi qua API fetch),
   - set `IsPinned = false`,
   - overwrite `ReplyContent` về placeholder cho mọi message có `ReplyId == messageId` (xem Reply chain).
5. `NotificationConsumer.HandleNotifyMessageRecalled`: fanout event `MessageRecalled` tới các member khác.

## 5. Authorization

Codebase hiện dùng validator `ContactRelatedToConversation` (chỉ check membership). Cần bổ sung các rule mới (đặt trong `Validator` class của từng endpoint, theo pattern `PinMessage.Validator` / `DeliveredMessage.Validator`):

- `IsSenderOfMessage(conversationId, messageId)` — cho edit và recall (khi không phải moderator).
- `IsModeratorOfConversation(conversationId)` — cho phép moderator recall message của member khác trong group.
- `IsWithinEditTtl` / `IsWithinRecallTtl` — kiểm tra `now - message.CreatedTime <= TTL`. **Enforce server-side trong validator/handler**, FE chỉ ẩn nút.
- `MessageNotRecalled(conversationId, messageId)` — chặn edit/recall message đã thu hồi.

## 6. TTL — configurable, enforce server-side

```jsonc
// appsettings.json
"MessageActions": {
  "EditTtlMinutes": 15,
  "RecallTtlMinutes": 15
}
```

- Bind qua options pattern, inject vào handler/validator.
- Enforce trong backend (validator), **không** tin TTL từ FE.
- Edit và recall có TTL riêng để tinh chỉnh độc lập (vd có thể nới edit dài hơn recall về sau).

## 7. Cache impact

Đây là phần dễ break nhất. Update message phải đồng bộ nhiều cache, tất cả đều phải idempotent (pattern giống `MemberCache.MemberSeenAll`: chỉ apply forward, no-op khi duplicate/out-of-order).

### `MessageCache` (`Application/Caching/MessageCache.cs`)

Thêm method mới song song với `UpdatePin` / `UpdateReactions`:

- `UpdateEdited(conversationId, messageId, content, editedTime)` — set `Content` + `EditedTime`, chỉ apply nếu `editedTime` mới hơn.
- `UpdateRecalled(conversationId, messageId, recalledTime, recalledByContactId)` — set `RecalledTime`/`RecalledByContactId`, clear `Content`/`Attachments`, set `IsPinned = false`. No-op nếu đã recalled.

> ⚠️ Lưu ý known-issue: `MessageCache` đang theo pattern read-modify-write không nguyên tử (đã ghi chú sẵn trong `AddMessages`). Các update mới kế thừa cùng rủi ro race; Mongo qua `DataStoreConsumer` là source-of-truth.

### `ConversationCache.LastMessage`

Xem `MessageCache.AddMessages` (đoạn cập nhật `ConversationCacheModel.LastMessage`). Khi **recall message cuối cùng** của conversation:

- **Quyết định**: set `LastMessage = "[Tin nhắn đã được thu hồi]"` (placeholder), giữ `LastMessageTime` nguyên. Đơn giản, không cần scan ngược tìm message kế trước (tránh chi phí query trên unbounded array).

### `AttachmentCache`

Recall message có attachment → phải xóa các attachment tương ứng khỏi `AttachmentCache` (gallery / Information panel). Nếu không, ảnh/file đã thu hồi vẫn hiển thị trong gallery.

## 8. Reply chain — rủi ro privacy

`Message.ReplyContent` là **snapshot text tại thời điểm reply** (không phải reference). Khi message gốc bị recall, nếu không xử lý thì reply vẫn hiển thị nội dung đã thu hồi → **leak privacy nghiêm trọng**.

**Chiến lược (eager, trong transaction recall):** khi recall `messageId`, cùng transaction Mongo update array filter overwrite `ReplyContent` về placeholder (vd `"[Tin nhắn đã được thu hồi]"`) cho **mọi** message có `ReplyId == messageId` trong conversation đó.

```csharp
// pseudo: trong HandleMessageRecalled, cùng UnitOfWork.SaveAsync
var replyFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
    new BsonDocument("reply.ReplyId", messageId));
updates.Set("Messages.$[reply].ReplyContent", RecalledPlaceholder);
```

Lý do chọn eager thay vì lazy (FE check map `messageId -> isRecalled` lúc render): message gốc có thể nằm ngoài cửa sổ paginated của FE, nên FE không phải lúc nào cũng có đủ thông tin để quyết định ẩn → eager đảm bảo đúng ở mọi trường hợp.

Edit message gốc **không** propagate sang `ReplyContent` của các reply (snapshot tại thời điểm reply là chấp nhận được; chỉ recall mới cần xử lý vì lý do privacy).

## 9. Search pipeline phải cập nhật

`Infrastructure/Repositories/ConversationRepository.SearchMessages` (pipeline `$unwind` + `$match`) hiện chỉ filter `Type == "text"` + regex content. Phải thêm điều kiện loại bỏ recalled:

```csharp
new BsonDocument("$match", new BsonDocument
{
    { "Messages.Type", "text" },
    { "Messages.Content", new BsonRegularExpression(escaped, "i") },
    { "Messages.RecalledTime", BsonNull.Value },   // bỏ message đã recall
}),
```

## 10. Frontend

Bám theo cách tính năng 1 đã làm (service + notificationHandlers + cacheHelpers + types).

Files cần sửa:

- `client/src/services/message.service.ts`: thêm `editMessage`, `recallMessage`.
- `client/src/utils/notificationHandlers.ts`: subscribe 2 event FCM mới `MessageEdited`, `MessageRecalled` → cập nhật cache `["conversation"]` / message list.
- `client/src/utils/notificationCacheHelpers.ts`: thêm helper idempotent `updateMessageEdited`, `updateMessageRecalled` (chỉ apply forward, preserve reference khi không đổi để tránh re-render thừa).
- `client/src/types/message.types.ts` + `notification.types.ts`: thêm field `editedTime`, `recalledTime`, `recalledByContactId` vào message type; thêm `MessageEditedEvent`, `MessageRecalledEvent`.

UI:

- Label `edited` cạnh message khi `editedTime != null`.
- Placeholder khi `recalledTime != null`: `message.recalled` → "Tin nhắn đã được thu hồi".

### Optimistic update strategy

- **Edit**: optimistic (UX tốt hơn — cập nhật ngay, rollback nếu API fail). Rủi ro thấp vì chỉ đổi text.
- **Recall**: **không** optimistic — chờ server confirm vì có TTL validation server-side (FE clock có thể lệch, nếu optimistic rồi server từ chối sẽ phải rollback gây nhấp nháy).

## 11. Edge cases cần xử lý

| Case | Cách xử lý |
|---|---|
| Recall message đang pin (`IsPinned = true`) | Auto-unpin trong transaction recall + cập nhật `MessageCache` (set `IsPinned = false`) |
| Recall message có reaction | Giữ nguyên reactions ở Mongo; FE ẩn reaction khi hiển thị placeholder recalled |
| Edit message đã gửi FCM notification | Không gửi push notification mới cho edit (tránh spam); chỉ fanout WebSocket event `MessageEdited` để cập nhật UI |
| Edit/recall attachment caption | Không hỗ trợ — endpoint edit chỉ accept message `type == "text"`. Media message chỉ có thể recall, không edit |
| Pending message (FE optimistic chưa có id từ server) | Edit/recall không áp dụng — FE chỉ cho cancel send, ẩn nút edit/recall đến khi có `messageId` thật |
| Concurrency: 2 thiết bị cùng sender edit đồng thời | Conditional update Mongo theo `EditedTime` (chỉ apply nếu mới hơn) — last-write-wins an toàn, idempotent |
| Recall rồi edit, hoặc edit rồi recall | `MessageNotRecalled` validator chặn edit sau recall; recall sau edit hợp lệ (recall thắng) |

## Lưu ý khi sử dụng

- Luôn soft recall (set flag/timestamp), **không** hard delete khỏi array — để giữ reply chain, audit, search consistency và tránh race với notification đã gửi.
- Recall clear `Content`/`Attachments` ở Mongo (không chỉ set cờ) để API fetch không trả về nội dung đã thu hồi.
- Search đã loại recalled message (mục 9).

## Rủi ro kỹ thuật

- `Conversation.Messages` là unbounded array; thêm metadata vào từng message làm tăng rủi ro document lớn, update array khó. Đã tối thiểu hóa: 3 field nhẹ (`EditedTime`, `RecalledTime`, `RecalledByContactId`).
- Reply chain: recall phải overwrite `ReplyContent` của các reply (mục 8) để tránh leak.
- Cache race: kế thừa known-issue read-modify-write của `MessageCache`; Mongo là source-of-truth, cache self-heal khi user re-login.
- Migration: message cũ thiếu field mới → Mongo deserialize về null/empty default → **không cần migration script**.
- Backward compat: chỉ thêm endpoint mới, không sửa endpoint cũ → an toàn. Không cần feature flag (soft flag tự an toàn — message cũ không bao giờ có `RecalledTime`).

## Tài liệu liên quan

- [Đề xuất tổng quan](../DE_XUAT_TINH_NANG_CHAT.md)
- [Tính năng 1: Delivery/Read receipts](TINH_NANG_1_DELIVERY_READ_RECEIPT.md)
