# Kế hoạch triển khai: Trang Informations (Notifications) & Settings

> **Mode:** PLANNING
> **Trạng thái:** ✅ Đã triển khai **toàn bộ Phase 1 + 2 + 3** (2026-06-23). Build BE/FE sạch.
> → Tiến độ & files: [`MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md`](./MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md)
> → API contract: [`../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md`](../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md)
> Còn lại 1 hạng mục **optional** chưa làm (cố ý): BE suppress push per-type — xem doc triển khai.
> **Phạm vi đã chốt với người dùng:** Full-stack · Có Dark mode · Notifications dùng refetch (không realtime push).
> **Session:** menu-notifications

---

## 0. Phân pha triển khai (ĐỌC TRƯỚC)

| Phase | Nội dung                                                                                             | Objective                  | Khả thi với API hiện có? | Rollback                              |
| ----- | ---------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------ | ------------------------------------- |
| **1** | Dark mode + Profile edit + Notifications page (FE thuần)                                             | Ship nhanh, value cao nhất | ✅ Có sẵn                | revert FE                             |
| **2** | BE `ContactSettings` + `GET/PUT settings` + enforce privacy mask → FE Notifications/Privacy settings | Per-type prefs + privacy   | ⚠️ Cần BE mới            | field có default, backward-compatible |
| **3** | BE `ChangePassword` + FE Account section                                                             | Đổi mật khẩu an toàn       | ⚠️ Cần BE mới            | endpoint độc lập                      |

| Hạng mục                                                  | Phase | Khả thi ngay?                         |
| --------------------------------------------------------- | ----- | ------------------------------------- |
| Dark mode (toggle `data-theme` + persist)                 | 1     | ✅ biến dark có sẵn `App.css`         |
| Profile edit (name/bio/avatar)                            | 1     | ✅ `updateInfo`                       |
| Notifications page (tabs, group time, deep-link, refetch) | 1     | ✅ `useNotification`/`read`/`readAll` |
| Notification prefs per-type + bật/tắt push                | 2     | ⚠️ cần `PUT /contacts/settings`       |
| Privacy (online status / last seen)                       | 2     | ⚠️ cần BE + enforce mask              |
| Đổi mật khẩu                                              | 3     | ⚠️ cần `PUT /contacts/password`       |

---

## 1. Bối cảnh & Hiện trạng (Current State Analysis)

### 1.1 Routing & layout

- TanStack Router file-based.
  - `/notifications` → `client/src/pages/Notification.tsx` — **placeholder** ("Welcome to notification page").
  - `/settings` → `client/src/pages/Setting.tsx` — **placeholder** ("Welcome to settings page").
- `client/src/pages/Connection.tsx` là **layout chuẩn vàng** để tái dụng:
  header + tabs (`shrink-0`) + vùng nội dung `flex-1 min-h-0 overflow-hidden` tự cuộn + `#portal` đặt NGOÀI flex container.

### 1.2 Data sẵn có — Notifications

- Hook: `useNotification()` → queryKey `["notification"]`, gọi `getNotifications` **hardcode `page=1, limit=10`**.
- Service (`client/src/services/notification.service.ts`): `read(id)`, `readAll()`, `requestPermission`, `registerConnection(token)`.
- BE đã có: `GetNotifications` (paged), `SeenNotification`, `SeenAllNotification` (`Presentation/Notification/*`).
- `NotificationModel`: `{ id, createdTime, updatedTime, content, read, contactId, sourceId, sourceType }`
  → có sẵn `sourceType` (phân loại/icon) và `sourceId` (deep-link).
- **Gap realtime:** `client/src/utils/notificationHandlers.ts` → `classifyNotification` chỉ cập nhật cache `["conversation"]`/`["friend"]`, **không đụng `["notification"]`**.
  → Quyết định: **dùng refetch khi vào trang** (không vá realtime đợt này).
- Dropdown notification ở sidebar (`client/src/components/sidebar/Notification.tsx`) dùng chung hook → phải giữ backward-compatible khi đổi signature.

### 1.3 Data sẵn có — Settings

- `UserProfile { name, avatar, bio, isOnline, lastLogout }`; `updateInfo(UpdateProfileRequest{name,bio,avatar})` (`auth.service.ts`).
- **Theme:** `data-theme` trên `<html>` **hardcode `"light"`** trong `client/index.html`.
  Bộ biến **dark đã định nghĩa đầy đủ** trong `client/src/styles/App.css` (`[data-theme="dark"]`) nhưng **chưa bao giờ được toggle** → bật dark mode là quick-win.
- FCM `requestPermission` + `registerConnection(token)` đã có.
- Chưa có: đổi mật khẩu thật (chỉ `forgotPassword`), preferences per-type, privacy → **cần BE mới**.

### 1.4 Pattern Backend

MediatR `Request/Handler` + FluentValidation `Validator` + Carter endpoint module + Mongo repository

- UnitOfWork (commit deferred ở `SaveAsync` — mọi code sau khi mutate PHẢI null-safe, không throw) + Redis `UserCache`/`FriendCache` + Firebase notify.

* `Domain/Entities/Contact.cs`: `Username, Password, Name, Avatar, Bio, IsOnline, LastLogin, LastLogout, RefreshToken, ExpiryDate`.
* `Domain/Entities/Notification.cs`: `Content, Read, ContactId, SourceId, SourceType`.
* Mẫu tham chiếu: `Presentation/Contact/UpdateContact.cs`, `Presentation/Friend/AcceptFriend.cs`.

---

## 2. Thiết kế giải pháp (Solution Design)

### 2.1 BACKEND

#### A1. Mở rộng domain — embedded `ContactSettings` (1-1, không tạo collection mới)

`Domain/Entities/Contact.cs`:

```csharp
public ContactSettings Settings { get; set; } = new();
```

`Domain/Entities/ContactSettings.cs`:

```csharp
public class ContactSettings {
  // Privacy
  public bool ShowOnlineStatus { get; set; } = true;
  public bool ShowLastSeen { get; set; } = true;
  // Notification prefs (per-type)
  public bool PushEnabled { get; set; } = true;
  public bool NotifyOnMessage { get; set; } = true;
  public bool NotifyOnFriendRequest { get; set; } = true;
  public bool NotifyOnReaction { get; set; } = true;
  public bool SoundEnabled { get; set; } = true;
}
```

> Mongo doc cũ thiếu field → C# default value xử lý. **Không cần migration.**

#### A2. Endpoints mới (mirror `UpdateContact.cs` / `AcceptFriend.cs`)

| Endpoint                 | File                                      | Mô tả                                                                                                                                                |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUT /contacts/settings` | `Presentation/Contact/UpdateSettings.cs`  | Cập nhật `ContactSettings`. Validator + UnitOfWork defer + sync `UserCache`.                                                                         |
| `PUT /contacts/password` | `Presentation/Contact/ChangePassword.cs`  | Body `{ oldPassword, newPassword }`. Verify old hash (theo cơ chế trong `Signin`), rule độ mạnh, cập nhật `Password`, **invalidate `RefreshToken`**. |
| `GET /contacts/settings` | gộp vào `Presentation/Contact/GetInfo.cs` | Trả `Settings` kèm `UserProfile` để FE hydrate 1 lần.                                                                                                |

#### A3. Enforce Privacy ở BE (correctness, KHÔNG chỉ ẩn FE)

Nơi build presence/`isOnline`/`lastLogout` (`PresencePing.cs`, `GetByContactId`, presence trong friend cache) phải tôn trọng `ShowOnlineStatus`/`ShowLastSeen` của **người được xem**:

- `ShowOnlineStatus = false` → trả `isOnline = false`.
- `ShowLastSeen = false` → trả `lastLogout = null`.

#### A4. Notifications

- Không cần entity mới. `GetNotifications` đã paged → FE truyền `page/limit` thật.
- (Tuỳ chọn) BE respect `Settings.NotifyOnX` trước khi push Firebase.

### 2.2 FRONTEND — Trang Informations (`/notifications`)

- Rewrite `pages/Notification.tsx` + `components/notification/*`, theo layout `Connection.tsx`.
- `routes/_layout.notifications.tsx`: **bỏ import `Home` thừa**; thêm `validateSearch` cho `?tab=`.
- **Tabs:** All / Unread / Requests / System (lọc theo `sourceType`).
- **Item:** icon theo `sourceType` + content + relative time + dot unread; click → `read(id)` + deep-link `sourceType`+`sourceId` (`/conversations/$id` hoặc `/connections`).
- **Group thời gian:** Today / Yesterday / Earlier (từ `createdTime`).
- **Pagination:** `getNotifications(page, limit)` (giữ default param → dropdown sidebar không vỡ) + `useInfiniteQuery` / nút "Load more".
- **Refetch on enter:** `invalidateQueries(["notification"])` khi mount + "Mark all as read" (`readAll`).
- Empty state + skeleton.

### 2.3 FRONTEND — Trang Settings (`/settings`) + Dark mode

- Rewrite `pages/Setting.tsx` + `components/settings/*`; section-nav trái: Profile / Appearance / Notifications / Privacy / Account.
- **Profile:** form name/bio/avatar → `updateInfo`, optimistic update cache `["info"]`.
- **Appearance — Dark mode:**
  - `useTheme` hook: set `document.documentElement.dataset.theme`, persist `localStorage["theme"]`.
  - **Chống flash:** inline script trong `index.html` đọc localStorage set `data-theme` TRƯỚC khi React mount (thay hardcode `"light"`).
- **Notifications:** toggle PushEnabled / Sound / per-type → `PUT /contacts/settings`; bật push gọi `requestPermission`+`registerConnection`.
- **Privacy:** ShowOnlineStatus / ShowLastSeen → `PUT /contacts/settings`.
- **Account:** đổi mật khẩu → `PUT /contacts/password`; logout (`Signout`).
- Thêm env endpoints + service funcs: `updateSettings`, `changePassword`, `getSettings`.

---

## 3. Phân pha triển khai (Implementation Planning)

→ Xem bảng phase ở **Section 0** (đầu tài liệu).

---

## 4. Đánh giá rủi ro (Risk Evaluation)

- **Privacy phải enforce ở BE** — mask presence của người bị xem; nếu chỉ ẩn FE sẽ lộ qua API/SignalR.
- **ChangePassword:** invalidate `RefreshToken`; verify đúng cơ chế hash hiện hữu (đọc `Signin` trước khi code).
- **Pagination signature:** giữ default param → không vỡ dropdown notification sidebar.
- **Theme flash:** set `data-theme` trước first paint.
- **Migration:** không cần — default value cho doc Mongo cũ.
- **Backward compatibility:** `GetInfo` thêm `Settings` không phá FE cũ (field optional).

---

## 5. Khuyến nghị cuối (Final Recommendation)

- **Approach:** triển khai tuần tự Phase 1 → 3; Phase 1 ship độc lập được.
- **Rejected alternative:** vá realtime cache `["notification"]` (người dùng chọn refetch — đơn giản, đủ tốt cho tần suất notification thấp).
- **Rejected alternative:** tách `ContactSettings` ra collection riêng — thừa cho quan hệ 1-1, tăng round-trip; embed vào `Contact` tối ưu hơn.
- **Maintainability:** mọi endpoint mới bám sát pattern MediatR/Carter hiện hữu → không tăng tải nhận thức.

---

## 6. Files dự kiến thay đổi

**Backend**

- `Domain/Entities/Contact.cs` (thêm `Settings`)
- `Domain/Entities/ContactSettings.cs` (mới)
- `Presentation/Contact/UpdateSettings.cs` (mới)
- `Presentation/Contact/ChangePassword.cs` (mới)
- `Presentation/Contact/GetInfo.cs` (trả thêm `Settings`)
- `Presentation/Contact/PresencePing.cs` + nơi build presence (enforce privacy)

**Frontend**

- `client/src/pages/Notification.tsx` (rewrite) + `client/src/components/notification/*` (mới)
- `client/src/pages/Setting.tsx` (rewrite) + `client/src/components/settings/*` (mới)
- `client/src/routes/_layout.notifications.tsx` (bỏ import thừa, thêm `validateSearch`)
- `client/src/services/notification.service.ts` (parametrize page/limit)
- `client/src/services/auth.service.ts` (thêm `updateSettings`, `changePassword`, `getSettings`)
- `client/src/hooks/useTheme.ts` (mới), `useNotification.ts` (hỗ trợ pagination)
- `client/index.html` (inline theme script chống flash)
- `client/.env*` (endpoints settings/password)
