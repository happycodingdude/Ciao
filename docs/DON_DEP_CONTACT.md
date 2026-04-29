# Dọn dẹp trạng thái Online của Contact

## Mục đích

Background job tự động quét bảng `Contact` mỗi 1 phút. Nếu một contact có `IsOnline = true` nhưng `LastLogin` đã quá 7 ngày tính từ thời điểm hiện tại (hoặc chưa từng login), job sẽ tự động set `IsOnline = false`.

`LastLogout` được giữ nguyên hoàn toàn, dùng để tính "user đã offline bao lâu" (`DateTime.Now - LastLogout`).

## Các thay đổi

### 1. Domain/Entities/Contact.cs
- Thêm field `LastLogin` (nullable DateTime): ghi lại thời điểm login gần nhất.
- Dùng `NullableLocalDateTimeSerializer` theo convention hiện tại.

### 2. Presentation/Identity/SignIn.cs
- Khi login thành công, thêm `.Set(q => q.LastLogin, DateTime.Now)` vào MongoDB update.
- `LastLogout` không bị chạm → bảo toàn để tính offline duration.

### 3. Application/Repositories/IContactRepository.cs
- Thêm method: `Task ResetStaleOnlineStatusAsync(DateTime threshold, CancellationToken cancellationToken)`

### 4. Infrastructure/Repositories/ContactRepository.cs
- Implement `ResetStaleOnlineStatusAsync`:
  - Filter: `IsOnline == true AND (LastLogin == null OR LastLogin < threshold)`
  - Update: `IsOnline = false`, `UpdatedTime = DateTime.Now`
  - Dùng `_collection.UpdateManyAsync` trực tiếp (bypass UoW/session) vì batch cleanup không cần transactional guarantees.

### 5. Infrastructure/BackgroundJobs/ContactCleanupService.cs *(file mới)*
- `BackgroundService` chạy tuần tự mỗi 1 phút.
- Tạo scoped DI scope để resolve `IContactRepository`.
- Tính `threshold = DateTime.Now - 7 ngày`, gọi `ResetStaleOnlineStatusAsync`.
- Handle `OperationCanceledException` để graceful shutdown khi app stop.
- Log error nếu có exception bất ngờ.

### 6. Chat.API/Configurations/InfrastructureServiceInstaller.cs
- Đăng ký: `services.AddHostedService<ContactCleanupService>()`

## Lý do thiết kế

- **Dùng `LastLogin` thay `LastLogout` cho job**: `LastLogout` thuộc về session trước, không phản ánh session hiện tại. Dùng `LastLogout` để detect stale gây conflict khi user vừa login mà `LastLogout` cũ > 7 ngày. `LastLogin` là signal đúng: nếu login cuối > 7 ngày mà `IsOnline=true` thì chắc chắn là stale.
- **`LastLogout` bảo toàn hoàn toàn**: Không bị reset khi login, dùng để tính `DateTime.Now - LastLogout` = thời gian user đã offline.
- **Xử lý null `LastLogin`**: User chưa có `LastLogin` (data cũ trước khi có feature) mà `IsOnline=true` → cũng reset, tránh stale vĩnh viễn.
- **Bypass UoW cho cleanup**: Batch update không cần transaction. `UpdateManyAsync` trực tiếp an toàn và hiệu quả hơn.

## Luồng hoạt động

```
Login       → IsOnline = true,  LastLogin = DateTime.Now,  LastLogout = <không đổi>
Job cleanup → LastLogin = hôm nay → LastLogin < threshold sai → bỏ qua ✅

Logout      → IsOnline = false, LastLogout = DateTime.Now
Job cleanup → IsOnline == false → bỏ qua ✅

Sau 7 ngày không login lại, IsOnline vẫn true (bị kẹt):
Job cleanup → IsOnline=true AND LastLogin < threshold → reset IsOnline=false ✅

Tính offline duration: DateTime.Now - LastLogout ✅ (LastLogout không bị ảnh hưởng)
```

## Index khuyến nghị (production)

```javascript
db.Contact.createIndex({ IsOnline: 1, LastLogin: 1 })
```
