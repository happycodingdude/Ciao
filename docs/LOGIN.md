# Chức năng Login

## Flow tổng quát

```
POST /api/v1/identity/signin
  → Xác thực username/password
  → Nếu chưa online: generate token + cập nhật Contact (IsOnline, LastLogin, RefreshToken) + produce Kafka UserLogin
  → Nếu đã online: lấy token từ cache
  → Trả về TokenModel
```

## DTOs

| Endpoint | Request DTO |
|---|---|
| POST /signin | `SignInRequest` (Username, Password) |
| POST /signup | `SignUpRequest` (Name, Username, Password) |
| POST /forgot | `ForgotPasswordRequest` (Username, Password) |
| POST /signin-cookie | `SignInRequest` (Username, Password) |

`IdentityRequest` dùng chung trước đây đã được tách thành 3 DTO riêng để rõ ràng hơn về contract.

## Bug fix: Race condition giữa GlobalTransactionMiddleware và CacheConsumer

### Vấn đề

`GlobalTransactionMiddleware` gọi `uow.SaveAsync()` **sau** khi handler return. Trong khi đó, `_kafkaProducer.ProduceAsync()` được gọi **trong** handler — trước khi middleware commit.

```
Handler:     1. UoW.Queue(Update Contact IsOnline=true)   ← chưa commit
             2. Kafka.Produce(UserLogin)                   ← fire ngay

Middleware:  3. uow.SaveAsync()                           ← commit MongoDB SAU

CacheConsumer (chạy song song, triggered bởi bước 2):
             4. GetInfoAsync(userId) → đọc MongoDB        ← có thể chạy trước bước 3
             5. SetInfo(user) → cache IsOnline=false       ← SAI: dữ liệu stale
```

### Fix

Inject `IUnitOfWork` vào `SignIn.Handler`, gọi `await _uow.SaveAsync()` **trước** `ProduceAsync`. Middleware's second `SaveAsync()` là no-op vì operations đã được cleared (`if (!operations.Any()) return`).

```csharp
_contactRepository.Update(filter, updates);
await _uow.SaveAsync();          // commit MongoDB trước

await _kafkaProducer.ProduceAsync(Topic.UserLogin, ...);  // Kafka sau
```

### Luồng sau khi fix

```
Handler:     1. UoW.Queue(Update Contact)
             2. uow.SaveAsync()       ← commit ngay trong handler
             3. Kafka.Produce(UserLogin)

Middleware:  4. uow.SaveAsync()       ← no-op (operations rỗng)

CacheConsumer:
             5. GetInfoAsync() → MongoDB đã có IsOnline=true ✅
             6. SetInfo(user)  → cache đúng ✅
```

## Lưu ý về DateTime

- `LastLogin` và field `UpdatedTime` dùng `DateTime.Now` (local time) — nhất quán với toàn bộ pipeline cleanup.
- `LastLogout` dùng `DateTime.UtcNow` — không nhất quán với `LastLogin`, cần chuẩn hóa trong tương lai.
- `RefreshToken` expiry trong `JwtService` dùng `DateTime.UtcNow` — đây là token expiry, cần UTC.
