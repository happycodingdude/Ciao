# Refactor Backend

## Mục đích

Sửa các lỗi nghiêm trọng, cải thiện hiệu năng và code quality trên toàn bộ backend.

## Các thay đổi thực hiện

### CRITICAL — Bugs gây data corruption / crash

#### 1. KafkaBackground: Scope per-message
**Vấn đề:** `CreateScope()` gọi một lần duy nhất bên ngoài vòng `while`, khiến tất cả messages trong suốt vòng đời consumer dùng chung 1 `UnitOfWork` (Scoped). Operations tích lũy không reset giữa các messages → data corruption.

**Fix:** Tạo scope mới bên trong vòng while, per-message. Mỗi message giờ có UnitOfWork, Repository riêng biệt.

#### 2. UnitOfWork: Loại bỏ JSON deserialization fragile
**Vấn đề:** `SaveAsync()` serialize `ReplaceOneResult`/`UpdateResult` thành JSON rồi deserialize lại sang `InvokeResult` để kiểm tra `ModifiedCount`. MongoDB transaction có thể trả `IsModifiedCountAvailable=false`, khiến fallback logic không bao giờ trigger đúng.

**Fix:** Dùng pattern matching trực tiếp trên MongoDB result types (`UpdateResult`, `ReplaceOneResult`, `DeleteResult`). Structured logging thay string interpolation.

#### 3. Validators: Xóa ServiceProvider anti-pattern
**Vấn đề:** 11 validators (SendMessage, AddFriend, AcceptFriend, CancelFriend, GetById, SignUp, SeenNotification, AddMember, DeleteMember, GetMessages, ReactMessage, PinMessage, CreateGroupConversation, UpdateConversation) giải quyết repositories qua `IServiceProvider` trong constructor, tạo scope ngay lập tức bị `Dispose()`. `UnitOfWork` của scope đó bị dispose trước khi rules chạy.

**Fix:** Inject repositories trực tiếp vào constructor validator. FluentValidation DI đã hỗ trợ sẵn.

### HIGH — Performance & Reliability

#### 4. N+1 lookups → Dictionary O(1)
**Vấn đề:** `NotificationConsumer` và `CacheConsumer` gọi `SingleOrDefault(q => q.Id == id)` 4 lần per member trong loop (Name, Avatar, Bio, IsOnline). O(n²) với n members.

**Fix:** Build `Dictionary<string, Contact>` từ contacts list, lookup O(1).

#### 5. ContinueWith → async/await
**Vấn đề:** `CacheConsumer.HandleUserLogin` dùng `.ContinueWith(task => { ... })` không nhận biết async, exception bị nuốt silently.

**Fix:** Dùng async lambdas và `Task.WhenAll`.

#### 6. Fire-and-forget trong UserCache
**Vấn đề:** `SetToken(...)` và `SetInfo(...)` dùng `_ = Task` không có error handling.

**Fix:** Đổi thành `async Task SetTokenAsync(...)` và `SetInfoAsync(...)`, await đúng cách. Update tất cả callers.

#### 7. KafkaProducer: Catch wrong exception type
**Vấn đề:** Catch `ProduceException<Null, string>` nhưng produce với `Message<string, string>`.

**Fix:** Đổi thành `ProduceException<string, string>`.

### MEDIUM — Code Quality

#### 8. Typo: ProcessMesageAsync → ProcessMessageAsync
`IGenericConsumer` interface và tất cả 3 implementations (DataStoreConsumer, NotificationConsumer, CacheConsumer).

#### 9. CancellationToken propagation
`ProcessMessageAsync` nhận `CancellationToken` và truyền xuống các handle methods.

#### 10. DateTime.Now → DateTime.UtcNow (toàn codebase)
Tất cả: MongoBaseModel, BaseModel, MongoBaseRepository, ConversationCache, MessageCache, ContactRepository, ContactCleanupService, SignIn, AcceptFriend, GetMessages.

#### 11. Redundant GetUserId() calls
`CreateDirectConversation`, `GetMessages`, `PinMessage`: Cache userId vào biến local thay vì gọi nhiều lần.

#### 12. Dead commented-out code
Xóa khỏi KafkaBackground, NotificationConsumer, CacheConsumer, InfrastructureServiceInstaller, UpdateContact.

#### 13. CORS configuration
Đọc origins từ `appsettings.json` section `Cors:Origins` thay vì hardcode `localhost:5000`. Fallback về `["http://localhost:5000"]` nếu không cấu hình.

### UTC Migration hoàn toàn

**Xóa `Domain/Serializers.cs`** và tất cả `[BsonSerializer(typeof(LocalDateTimeSerializer))]` / `[BsonSerializer(typeof(NullableLocalDateTimeSerializer))]` khỏi entities và DTOs. Dùng MongoDB C# driver default — lưu và đọc UTC không cần custom code.

Tất cả `DateTime` fields (`CreatedTime`, `UpdatedTime`, `LastSeenTime`, `LastLogin`, `LastLogout`, `AcceptTime`, `ExpiryDate`) giờ đều là UTC.

## Lưu ý sử dụng

- **CORS**: Thêm vào `appsettings.json`:
  ```json
  "Cors": {
    "Origins": ["http://localhost:5000", "https://your-prod-domain.com"]
  }
  ```
- **Scope per-message**: `DataStoreConsumer`, `CacheConsumer`, `NotificationConsumer` đều Scoped — đây là đúng, DI container tạo instance mới per-message.
- `SetToken` → `SetTokenAsync`, `SetInfo` → `SetInfoAsync` trong `UserCache`.
