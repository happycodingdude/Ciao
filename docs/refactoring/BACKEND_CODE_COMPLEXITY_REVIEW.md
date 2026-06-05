# BACKEND_CODE_COMPLEXITY_REVIEW

## Mục đích

Review độ phức tạp của backend codebase (.NET 10 + MongoDB + Redis + Kafka + SignalR), xác định các block code có rủi ro cao trong production và bổ sung comment chú thích để team dễ bảo trì.

Phạm vi review: `Application/`, `Domain/`, `Infrastructure/`, `Presentation/`, `Shared/`, `Chat.API/`.

## Đánh giá tổng quan

Kiến trúc rõ ràng theo Clean Architecture (Domain → Application → Infrastructure → Presentation). Các điểm phức tạp tập trung ở 4 nhóm:

1. **Kafka background consumers** — fire-and-forget Task.Run, scope-per-message, retry & commit offset.
2. **MongoDB repositories** — pipeline aggregate nhiều stage (lookup, unwind, group, project, cond).
3. **Redis cache** — pattern read-modify-write không nguyên tử, race condition tiềm tàng.
4. **SignalR + Notification** — quản lý connection/group, idempotency, fan-out.

## Block code phức tạp đã thêm comment

| File | Block | Loại phức tạp | Note |
|---|---|---|---|
| `Infrastructure/BackgroundJobs/DataStoreConsumer.cs` | `ProcessMessageAsync.finally` | Kafka commit | Commit offset bất kể success/fail → không có Kafka redelivery, retry phải tự xử lý |
| `Infrastructure/BackgroundJobs/DataStoreConsumer.cs` | `HandleNewDirectConversation` | Branch logic | 2 nhánh new vs old conversation |
| `Infrastructure/BackgroundJobs/DataStoreConsumer.cs` | `HandleNewReaction` | Mongo nested array upsert | Pattern init → update → fallback dùng `key` link UoW |
| `Infrastructure/BackgroundJobs/CacheConsumer.cs` | `HandleUserLogin` | Concurrency fan-out | 3 task song song qua `Task.WhenAll`, hardcoded paging (1, 100) |
| `Infrastructure/BackgroundJobs/KafkaBackground.cs` | `ExecuteAsync` | Background lifecycle | Fire-and-forget Task.Run cho từng consumer |
| `Infrastructure/BackgroundJobs/KafkaBackground.cs` | `ConsumeAsync` | Consume loop + DI scope | Tạo scope per-message để isolate UnitOfWork |
| `Infrastructure/Repositories/UnitOfWork.cs` | `SaveAsync` | Mongo transaction + fallback | Fallback theo `key`, exception bị nuốt — caller không biết transaction fail |
| `Infrastructure/Repositories/ConversationRepository.cs` | `GetConversationsWithUnseenMesages` | Mongo pipeline | 7 stage, index-sensitive, $unwind nhân số document |
| `Infrastructure/Repositories/FriendRepository.cs` | `GetFriendItems` | Mongo pipeline | Lookup contact "người kia" qua $cond, DirectConversation null-able |
| `Infrastructure/Repositories/ContactRepository.cs` | `SearchContactsWithFriendStatus` | Mongo pipeline | Yêu cầu text index, FriendStatus 4 nhóm qua nested $cond |
| `Application/Caching/MessageCache.cs` | `AddMessages` | Race condition | 4 task song song RMW Redis, KHÔNG nguyên tử |
| `Application/Caching/MessageCache.cs` | `UpdateReactions` | Race condition | RMW reactions list trên Redis |
| `Application/Caching/ConversationCache.cs` | `GetConversations` | Concurrency | `lock(result)` quanh `List.Add` khi fan-out |
| `Application/Caching/MemberCache.cs` | `MemberSeenAll` | Invariant | Mỗi user chỉ có 1 conversation IsSelected=true |
| `Application/Notifications/SignalHub.cs` | `OnConnectedAsync` | Multi-device | Chỉ giữ 1 connection chính / user |
| `Infrastructure/Notifications/WebSocketProcessor.cs` | `Notify(group, uniqueId, ...)` | Idempotency | Redis SETNX làm distributed dedup lock 2 phút |
| `Infrastructure/Notifications/FirebaseFunction.cs` | `Notify(string[], ...)` | DI captive dependency | Tạo scope thủ công vì singleton resolve scoped |
| `Infrastructure/BackgroundJobs/NotificationConsumer.cs` | `HandleNewMessage` | Fan-out filter | Loại sender khỏi list nhận notify, ẩn Content khi không phải text |
| `Presentation/Friend/AddFriend.cs` | `Handle` (push notify) | Eventual consistency | Fire-and-forget notify, accept fail → client bù trừ ở fetch sau |

## Khuyến nghị cải thiện sau này

### Mongo
- Bổ sung index: `Conversation.Members.ContactId`, `Conversation.UpdatedTime: -1`, `Friend.FromContact.ContactId`, `Friend.ToContact.ContactId`, text index trên `Contact.Name`.
- Pipeline `GetConversationsWithUnseenMesages`: cân nhắc `$slice` cho `Messages` để giới hạn payload khi history dài.
- `UnitOfWork.SaveAsync`: throw lại exception thay vì chỉ log, để caller có thể quyết định retry/báo lỗi user.

### Redis cache
- Pattern read-modify-write trên Redis (MessageCache, ConversationCache) có race condition. Hướng cải thiện:
  - Dùng Redis list (`LPUSH`/`RPUSH`) thay vì serialize cả `List<T>`.
  - Hoặc viết Lua script atomic cho các thao tác phức tạp.
  - Hoặc dùng distributed lock (Redlock) khi tần suất ghi cao.

### Kafka
- `Commit` ở `finally` đồng nghĩa message lỗi sẽ không retry — nên có DLQ (dead-letter queue) hoặc retry topic.
- Tách thread riêng (LongRunning task) thay vì `Task.Run` mặc định để tránh chiếm thread pool khi cluster lớn.

### Notification
- `FirebaseFunction.Notify` lookup connection tuần tự — chuyển sang Redis MGET batch để giảm latency.
- `SignalHub` không support multi-device — nếu cần, đổi cache `userId → connectionId` thành `userId → Set<connectionId>`.

## Lưu ý khi sử dụng

- Khi đọc các file đã được thêm comment, ưu tiên đọc comment header của method/block trước khi đọc code chi tiết.
- Comment chú trọng "WHY" và "TRADE-OFF" hơn là "WHAT" — code đã tự nói lên `what`, comment chỉ cảnh báo các điểm dễ vỡ ở production.
- Khi sửa các block đã được comment, kiểm tra lại invariant nêu trong comment để không phá vỡ giả định đang có.
