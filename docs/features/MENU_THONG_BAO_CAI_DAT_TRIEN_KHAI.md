# Handoff — Trang Informations (`/notifications`) & Settings (`/settings`)

> Mục đích: ghi lại trạng thái triển khai để tiếp tục ở phiên mới. Cập nhật tới 2026-06-23.
> Kế hoạch gốc: [`MENU_THONG_BAO_CAI_DAT.md`](./MENU_THONG_BAO_CAI_DAT.md).
> API contract: [`../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md`](../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md).

## Trạng thái tổng quan

Đã triển khai **toàn bộ Phase 1 + 2 + 3** của kế hoạch. Build sạch:

- Backend `dotnet build` ✅ **0 errors** (chỉ warning nullable pre-existing).
- Frontend `tsc --noEmit` ✅ sạch trên mọi file mới; `vite build` ✅ exit 0
  (sinh chunk `_layout.notifications`, `_layout.settings`).
- Route tree đã regenerate (`tsr generate`) cho `validateSearch` mới.

> ⚠️ Pre-existing (KHÔNG do feature này): 3 lỗi `useRef(undefined)` ở
> `AddMembersModal.tsx` / `CreateGroupChatModal.tsx` — tồn tại sẵn trên HEAD, dự án build
> bằng `vite`/esbuild nên không chặn.

| Phase | Nội dung | Trạng thái |
| ----- | -------- | ---------- |
| **1** | Dark mode + Profile edit + Notifications page (FE thuần) | ✅ Done |
| **2** | BE `ContactSettings` + `GET/PUT settings` + enforce privacy mask → FE Notifications/Privacy | ✅ Done |
| **3** | BE `ChangePassword` + FE Account section | ✅ Done |

Scope đã chốt: Full-stack · Có Dark mode · Notifications dùng **refetch** (không realtime push).

---

## Backend đã làm

| File | Nội dung |
| ---- | -------- |
| `Domain/Entities/ContactSettings.cs` (mới) | Embedded 1-1 trên `Contact`, default tất cả "bật" → **không cần migration** (doc cũ thiếu field giữ default). |
| `Domain/Entities/Contact.cs` | Thêm `public ContactSettings Settings { get; set; } = new();` → `GetInfo` tự trả kèm (FE hydrate 1 lần, không cần endpoint `GET /settings` riêng). |
| `Application/DTOs/IdentityDTO.cs` | Thêm `ChangePasswordRequest { OldPassword, NewPassword }`. |
| `Presentation/Contact/UpdateSettings.cs` (mới) | `PUT /contacts/settings`. Update defer UnitOfWork + sync `UserCache` (privacy mask đọc Settings từ cache này). |
| `Presentation/Contact/ChangePassword.cs` (mới) | `PUT /contacts/password`. Verify hash cũ (đọc **DB** để có Password — cache bị `[JsonIgnore]`), rule độ mạnh (`IPasswordValidator`), **invalidate `RefreshToken`/`ExpiryDate`**. |
| `Application/Caching/UserCache.cs` | `IsOnlineVisibleAsync(userId)` — mask `ShowOnlineStatus` (fail-open khi cache miss). |
| `Presentation/Conversation/GetConversations.cs` | Inject `UserCache`, đổi presence sang `IsOnlineVisibleAsync`. |
| `Presentation/Friend/GetFriendSuggestions.cs` | Mask trực tiếp bằng `c.Settings?.ShowOnlineStatus` (Contact đã load từ DB). |
| `Application/Caching/UserCache.cs` → `SyncUserInfo` | Friend list dùng `IsOnlineVisibleAsync`. |

**Privacy enforce đúng bản chất:** mask `ShowOnlineStatus` ở **BE** tại 3 điểm đọc presence live
(friend list / conversation members / friend suggestions), không chỉ ẩn FE. `ShowLastSeen` được
lưu nhưng `lastLogout` hiện **chưa lộ ra ngoài** qua API/SignalR (đã kiểm tra toàn repo) → chưa có
leak cần vá; khi nào expose `lastLogout` cho người khác thì mask tại đúng điểm đó.

---

## Frontend đã làm

### Informations (`/notifications`)
- `pages/Notification.tsx` (rewrite) theo layout vàng `Connection.tsx` (`#portal` ngoài flex container).
- `components/notification/`: `NotificationTabs`, `NotificationItem`, `NotificationList`.
- Tabs **All / Unread / Requests / System** (lọc client-side theo `sourceType` + `read`).
- Group **Today / Yesterday / Earlier** (`utils/notificationDisplay.ts`).
- Deep-link: `friend_request` → `/connections?tab=requests`; còn lại có `sourceId` → `/conversations/$id`.
- **Pagination thật**: `useInfiniteNotifications` (`hooks/useNotification.ts`) + nút "Load more";
  service `getNotifications(page, limit)` qua `VITE_ENDPOINT_NOTIFICATION_GET_PAGED`.
- Refetch-on-enter (invalidate cả `["notification"]` của sidebar) + "Mark all as read" + skeleton + empty.
- `routes/_layout.notifications.tsx`: bỏ import `Home` thừa + thêm `validateSearch(?tab=)`.

### Settings (`/settings`) + Dark mode
- `pages/Setting.tsx` (rewrite): section-nav trái **Profile / Appearance / Notifications / Privacy / Account**.
- `hooks/useTheme.ts` + inline script chống flash trong `index.html` (set `data-theme` trước first paint).
- `hooks/useSettings.ts`: optimistic update `["info"]` + rollback khi lỗi.
- `components/settings/`: `SettingsNav`, `SettingsCard`, `SettingToggle`, `ProfileSection`,
  `AppearanceSection`, `NotificationsSection`, `PrivacySection`, `AccountSection`.
- Profile → `updateInfo` (optimistic `["info"]`). Notifications → `updateSettings`; bật push gọi
  `requestPermission`+`registerConnection`. Privacy → `updateSettings`. Account → `changePassword`
  (BE revoke refresh token → FE **auto signout** + redirect `/auth`) + nút Sign out.
- `services/auth.service.ts`: thêm `updateSettings`, `changePassword`.
- `components/layouts/SideBarMenu.tsx`: thêm `search={{ tab: "all" }}` cho link `/connections` & `/notifications`
  (do route giờ có required search param).

### Types / env
- `types/base.types.ts`: thêm `ContactSettings`, `ChangePasswordRequest`, `UserProfile.settings?`.
- `types/notification.types.ts`: `NotificationTab` + `NOTIFICATION_TABS`.
- `types/settings.types.ts` (mới): `SettingsSectionKey` + `SETTINGS_SECTIONS`.
- `.env`: `VITE_ENDPOINT_NOTIFICATION_GET_PAGED`, `VITE_ENDPOINT_CONTACT_SETTINGS`, `VITE_ENDPOINT_CONTACT_PASSWORD`.

---

## ⚠️ Hạng mục optional CHƯA làm (cố ý defer)

**BE suppress push per-type trước khi gọi Firebase** (`Settings.NotifyOnX` / `PushEnabled`).
Plan đánh dấu *"Tuỳ chọn"*; nằm trên hot-path (nhiều `_firebaseFunction.Notify` rải rác,
fail-open khi cache miss) → defer để tránh regression. Hiện preferences đã **lưu đầy đủ**, toggle
`PushEnabled` điều khiển device-registration phía FE.

**Khi làm:** thêm filter recipient ngay trong `FirebaseFunction.Notify` (single chokepoint) —
map `_event` → `NotifyOnX`, đọc `Settings` từ `UserCache`, loại bỏ contactId tắt push.
`SoundEnabled` hiện chỉ lưu (app chưa có hệ thống âm thanh notification) — wire khi cần.

---

## Cách verify nhanh

```bash
# Backend
"/path/to/dotnet" build Chat.API/Chat.API.csproj

# Frontend (Windows node trong WSL)
cd client
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json   # typecheck
node node_modules/@tanstack/router-cli/bin/tsr.cjs generate       # regen route tree nếu sửa validateSearch
node node_modules/vite/bin/vite.js build                          # bundle
```

Manual: bật/tắt Dark mode (reload không flash), đổi tên/bio/avatar, toggle privacy/notification,
đổi mật khẩu (phải bị signout), tab + Load more + Mark all as read ở `/notifications`.
