# Trạng thái tính năng — Connections & Settings

> Bảng theo dõi tiến độ 2 trang. Cập nhật: 2026-06-23.
> Chi tiết kỹ thuật:
> - Connections → [`CONNECTIONS_HANDOFF.md`](./CONNECTIONS_HANDOFF.md)
> - Settings → [`MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md`](./MENU_THONG_BAO_CAI_DAT_TRIEN_KHAI.md)
>   + API: [`../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md`](../api-changes/MENU_THONG_BAO_CAI_DAT_API_CHANGES.md)

Chú thích: `[x]` done · `[ ]` todo · ⚠️ lưu ý vận hành/rủi ro.

---

## 🔗 Connections (`/connections`)

> Đã chạy ổn định + có data-migration. Build BE/FE sạch.

### Done
- [x] Tabs **All / Online / Requests / Add** + deep-link `?tab=` (validateSearch)
- [x] Friend flow đầy đủ: Add / Accept / Deny / Cancel / **Unfriend** (`DELETE /friends/{id}`, phân nhánh event Cancel/Deny/Unfriend)
- [x] Gợi ý kết bạn theo bạn-chung (`GET /friends/suggestions`, friends-of-friends)
- [x] Tab All: search + toggle **A-Z sort/group**; cắt bio; nút Chat điều hướng
- [x] Realtime qua **FCM** (không SignalR) — cập nhật cache `["friend"]` trực tiếp từ payload
- [x] Single source = cache `["friend"]`, **không poll**; UnfriendMenu render qua portal; accent xanh `light-blue-500`

### TODO / lưu ý
- [ ] ⚠️ **Index Mongo** `Friend.FromContact.ContactId` & `ToContact.ContactId` (tránh full-scan khi suggestions scale)
- [ ] ⚠️ **Backfill `AcceptTime`** dữ liệu cũ: `scripts/backfill_accept_time.py --apply` (cần để suggestion dùng bạn cũ làm cầu nối)
- [ ] **Presence realtime**: hiện online/offline chỉ đúng lúc load (bỏ poll, FCM không đẩy presence) → muốn realtime phải đẩy event presence qua FCM
- [ ] ~~Block/Unblock~~, ~~sinh nhật~~ — **out-of-scope đã chốt** (sinh nhật cần field `DateOfBirth`)

---

## ⚙️ Settings (`/settings`)

> Vừa hoàn tất. Build BE (`dotnet build`) + FE (`tsc`) sạch.
> ⚠️ **Chưa verify end-to-end với backend thật** (mới test layout/typecheck).

### Done
- [x] **Dark mode**: `useTheme` + inline script chống flash; toggle Light/Dark persist localStorage
- [x] **Profile**: avatar — click icon máy ảnh để đổi (upload Firebase → `mediaUrl`), click ảnh → lightbox xem lớn; name/bio → `updateInfo` optimistic; form gọn vừa 1 màn hình (không scroll/cắt)
- [x] **Notifications**: toggle PushEnabled / Sound / per-type (Message / FriendRequest / Reaction) → `PUT /contacts/settings`; bật push gọi `requestPermission`+`registerConnection`
- [x] **Privacy**: ShowOnlineStatus / ShowLastSeen → `PUT /contacts/settings`
- [x] **Enforce ShowOnlineStatus ở BE** (mask presence 3 điểm: friend list, conversation, suggestions)
- [x] **Account**: đổi mật khẩu (`PUT /contacts/password` — verify cũ, **mới ≠ cũ**, invalidate refresh token → auto signout) + toggle con mắt xem mật khẩu + nút Sign out
- [x] BE: `ContactSettings` embedded (no migration); `GetInfo` trả kèm `settings`

### TODO / chưa làm
- [ ] **BE suppress push per-type** trước khi gọi Firebase (`PushEnabled`/`NotifyOnX`) — **cố ý defer** (optional, hot-path). Hiện preferences chỉ được **lưu**, chưa chặn push thật ở server. Chốt khi cần: filter recipient trong `FirebaseFunction.Notify` (single chokepoint)
- [ ] **SoundEnabled**: mới lưu, **chưa wire** âm thanh notification thật (app chưa có hệ thống sound)
- [ ] **ShowLastSeen**: đã lưu nhưng `lastLogout` hiện **chưa lộ ra ngoài** cho người khác → chưa cần enforce; khi nào expose mới mask
- [ ] ⚠️ **Vận hành**: cần **restart backend** để nạp 2 endpoint mới (`/contacts/settings`, `/contacts/password`)
- [ ] **Verify end-to-end**: chạy app test thực tế đổi avatar / mật khẩu / privacy mask / dark mode

---

## Lệnh nhanh

```bash
# Backend
"/path/to/dotnet" build Chat.API/Chat.API.csproj
"/path/to/dotnet" run --project Chat.API        # restart để nạp endpoint mới

# Frontend (Windows node trong WSL)
cd client
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node node_modules/vite/bin/vite.js build
```
