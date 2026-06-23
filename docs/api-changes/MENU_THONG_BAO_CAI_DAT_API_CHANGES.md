# API Changes — Informations & Settings

> Feature: [`../features/MENU_THONG_BAO_CAI_DAT.md`](../features/MENU_THONG_BAO_CAI_DAT.md)
> Triển khai: [`../features/MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md`](../features/MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md)
> Cập nhật: 2026-06-23 · Backward-compatible (không phá client cũ).

## 1. `GET /api/v1/contacts/info` (đã có — payload mở rộng)

Trả thêm field `settings` (additive, FE cũ bỏ qua được).

```jsonc
{
  "id": "…", "name": "…", "avatar": "…", "bio": "…",
  "isOnline": true, "lastLogout": "2026-06-23T…",
  "settings": {                      // 👈 MỚI
    "showOnlineStatus": true,
    "showLastSeen": true,
    "pushEnabled": true,
    "notifyOnMessage": true,
    "notifyOnFriendRequest": true,
    "notifyOnReaction": true,
    "soundEnabled": true
  }
}
```

> Doc Mongo cũ thiếu `Settings` → C# default value (`new()`) tự xử lý, **không cần migration**.

## 2. `PUT /api/v1/contacts/settings` (MỚI) 🔒 auth

Cập nhật privacy + notification preferences. Body = full `ContactSettings`.

```jsonc
// Request body
{
  "showOnlineStatus": false,
  "showLastSeen": true,
  "pushEnabled": true,
  "notifyOnMessage": true,
  "notifyOnFriendRequest": true,
  "notifyOnReaction": false,
  "soundEnabled": true
}
// 200 OK (no body)
```

Side-effects: ghi DB (defer UnitOfWork) + sync `UserCache`. `ShowOnlineStatus=false` được
**enforce ở BE** — friend list / conversation members / friend suggestions trả `isOnline=false`.

## 3. `PUT /api/v1/contacts/password` (MỚI) 🔒 auth

Đổi mật khẩu.

```jsonc
// Request body
{ "oldPassword": "…", "newPassword": "…" }
// 200 OK (no body)
```

- Verify `oldPassword` theo cơ chế hash hiện hữu (salt = Username, giống `SignIn`).
- `newPassword` qua `IPasswordValidator` (rule độ mạnh giống SignUp/Forgot).
- **Invalidate `RefreshToken` + `ExpiryDate`** → client phải đăng nhập lại (FE auto signout).
- Lỗi → `400 BadRequest` kèm message (`"Current password is incorrect"`, lỗi rule, …).

## 4. `GET /api/v1/notifications` (đã có — FE dùng paging thật)

Endpoint đã hỗ trợ `?page=&limit=` từ trước; FE giờ truyền tham số thật
(`VITE_ENDPOINT_NOTIFICATION_GET_PAGED = '/notifications?page={page}&limit={limit}'`).
Mặc định (không truyền) vẫn `page=1, limit=10` → **không phá** dropdown sidebar.

---

### Frontend env mới (`client/.env`)
```
VITE_ENDPOINT_CONTACT_SETTINGS = '/contacts/settings'
VITE_ENDPOINT_CONTACT_PASSWORD = '/contacts/password'
VITE_ENDPOINT_NOTIFICATION_GET_PAGED = '/notifications?page={page}&limit={limit}'
```
