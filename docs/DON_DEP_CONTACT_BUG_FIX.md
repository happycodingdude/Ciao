# Bug Fix: ContactCleanupService xung đột với chức năng Login

## Mô tả bug

Khi user login, `IsOnline` được set `true` nhưng `LastLogout` vẫn giữ nguyên giá trị từ lần logout trước.
Nếu lần logout đó cách hiện tại hơn 7 ngày, `ContactCleanupService` sẽ match filter và set `IsOnline = false`
trong vòng chạy kế tiếp (tối đa 1 phút sau), khiến user bị "đá offline" ngay sau khi vừa login.

## Root cause

```
User login  → IsOnline = true
               LastLogout = <giá trị cũ, ví dụ 10 ngày trước>  ← không được reset

ContactCleanupService (1 phút sau):
    Filter: IsOnline == true ✅ AND LastLogout != null ✅ AND LastLogout < 7 ngày trước ✅
    → Set IsOnline = false   ← BUG
```

## Fix

**File:** `Presentation/Identity/SignIn.cs`

Khi login thành công, thêm `.Set(q => q.LastLogout, (DateTime?)null)` vào MongoDB update.

```csharp
var updates = Builders<Contact>.Update
    .Set(q => q.IsOnline, true)
    .Set(q => q.LastLogout, (DateTime?)null)   // ← reset để job bỏ qua
    .Set(q => q.RefreshToken, refreshToken)
    .Set(q => q.ExpiryDate, expiryDate);
```

## Tại sao đúng về semantic

- User đang trong session mới → chưa logout → `LastLogout = null` là đúng.
- `ContactCleanupService` có filter `LastLogout != null` → tự động bỏ qua user này.
- Khi user logout thật sự → `LastLogout` được ghi lại → job hoạt động bình thường trở lại.

## Luồng sau khi fix

```
Login       → IsOnline = true,  LastLogout = null
Job cleanup → LastLogout != null → false → bỏ qua ✅

Logout      → IsOnline = false, LastLogout = DateTime.Now
Job cleanup → IsOnline == false → bỏ qua ✅

Login lại   → IsOnline = true,  LastLogout = null lại ✅
```
