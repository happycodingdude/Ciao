# Handoff — Tính năng Connections (`/connections`)

> Mục đích: tiếp tục ở phiên mới. Cập nhật tới 2026-06-21.
> Kế hoạch gốc: [`CONNECTIONS_KET_NOI.md`](./CONNECTIONS_KET_NOI.md).

## Trạng thái tổng quan

Trang **Connections** (hub quản lý bạn bè) đã hoàn thành **Phase 1 + 2 + 3** + nhiều fix UX/bug.
Build sạch: client `npm run build` ✅, backend `dotnet build` ✅ (0 errors). Lint: chỉ còn lỗi
pre-existing ở file cũ không liên quan (`profile/*.jsx`, `tailwind.config.js`, `vite.config.js`).

Scope đã chốt với user: **KHÔNG làm Block/Unblock**, **KHÔNG làm sinh nhật** (cần schema migration).

- ✅ Phase 1 — Frontend MVP: 4 tab `All / Online / Requests / Add`, deep-link `?tab=`.
- ✅ Phase 2 — Backend Deny + Unfriend (`RemoveFriend` thay `CancelFriend`) + wire FE.
- ✅ Phase 3 — A-Z sort/group toggle (tab All) + gợi ý bạn chung (`GET /friends/suggestions`).
- ✅ Realtime qua **Firebase/FCM** (không dùng SignalR cho friend).
- ✅ Fixes: căn nút, popover portal (mở ngang icon ba chấm), Add-tab reconcile từ cache,
  cắt ngắn bio, nút Chat điều hướng, fix endpoint create-direct body optional.

## Kiến trúc & quyết định quan trọng

1. **Single source of truth = React Query cache `["friend"]`** (key `["friend"]`). Trang dùng
   `useFriend()` **KHÔNG poll** (đã bỏ `refetchInterval` — realtime do FCM lo). Mọi tab phái sinh
   status từ cache này — kể cả **tab Add** (search results lấy identity từ `getContacts`, nhưng
   status nút map từ cache `relByContactId`; không có trong cache → `"new"`). Đây là fix cho bug
   "deny không flip nút".
   - ⚠️ Hệ quả của việc bỏ poll: **presence online/offline ở tab Online/All không tự cập nhật**
     realtime (FCM không đẩy presence) — chỉ đúng tại thời điểm load/refetch. Chấp nhận tradeoff
     này theo yêu cầu "không dùng internal fetch/polling". Cần presence realtime → phải đẩy qua FCM.

2. **Realtime = Firebase Cloud Messaging** (user đã chuyển từ SignalR sang Firebase). BE đẩy event
   bằng `IFirebaseFunction.Notify(event, userIds[], data)` (FCM data-message `{event, data}`).
   Client nhận ở `requestPermission` → `onMessage` → `classifyNotification` (`SignalContext`).
   Handler trong `utils/notificationHandlers.ts` cập nhật cache `["friend"]` TRỰC TIẾP từ payload
   (`friendId`), không refetch (trừ `NewFriendRequest` phải refetch vì thiếu contact info).
   - ⚠️ FCM `onMessage` chỉ fire khi **foreground** + đã cấp Notification permission. Poll 30s là fallback.
   - `signalManager.ts`/SignalR là **dead code**, không dùng.

3. **Popover Unfriend** render qua `createPortal(document.body)` + `position: fixed` để không bị
   `overflow-y-auto` của khung danh sách cắt; mở **ngang** với icon ba chấm.

4. **Nút Chat** (`ConnectionChatButton`) ĐIỀU HƯỚNG (`router.navigate`) khác `FriendCtaButton.chat`
   (chỉ set cache, hợp trang Chats). Ưu tiên `contact.directConversation`; chưa có → `createDirectChat`.

## Files chính

**Frontend — `client/src/components/connection/`** (mới): `ConnectionTabs`, `ConnectionFriendList`
(search + A-Z toggle), `ConnectionRequests`, `ConnectionContact` (row dùng chung), `ConnectionEmpty`,
`AddFriendPanel` (search + suggestions), `DenyButton`, `UnfriendMenu` (portal), `ConnectionChatButton`.
- `pages/Connection.tsx` — container, `getRouteApi("/_layout/connections")`, derive lists, `handleFriendAction` (optimistic cache).
- `routes/_layout.connections.tsx` — `validateSearch` cho `?tab=`.
- `types/connection.types.ts` — `ConnectionTab`.
- `services/friend.service.ts` — `removeFriend`, `getFriendSuggestions`.
- `types/friend.types.ts` — `FriendSuggestion`.
- `utils/notificationHandlers.ts` — case friend events (FCM).
- `components/home/*` — deep-link `search` từ Dashboard stats/quick-actions.

**Backend** (mới): `Presentation/Friend/RemoveFriend.cs` (DELETE `/friends/{id}`, validator
participant-only, phân nhánh event Cancel/Deny/Unfriend, đồng bộ FriendCache 2 phía),
`Presentation/Friend/GetFriendSuggestions.cs` (`GET /friends/suggestions?limit=`, friends-of-friends).
- Sửa: `AddFriend`/`AcceptFriend`/`RemoveFriend` → `_firebase.Notify`. `ChatEventNames`
  (+`FriendRequestDenied`,`Unfriended`). `FriendDTO` (+`FriendSuggestionItem`).
  `CreateDirectConversation.cs` — body optional (`CreateDirectConversationReq?`).
- Xoá: `Presentation/Friend/CancelFriend.cs`, `client/src/components/friend/DenyButton.jsx` (legacy hỏng).

## Cập nhật phiên 2 (2026-06-21) — bug fix & polish

1. **🔴 Root-cause "suggestion không hiện": AcceptFriend rollback mất `AcceptTime`.**
   `AcceptFriend`/`AddFriend` đọc `_friendCache.GetFriends()` (Redis) rồi `.SingleOrDefault`/`.Add`
   ngay; khi cache trống → NRE. Vì `_friendRepository.Update/Add` **defer** vào `UnitOfWork` (commit
   ở `uow.SaveAsync()` do `GlobalTransactionMiddleware` gọi **sau** handler), handler throw ⇒
   `SaveAsync()` không chạy ⇒ **`AcceptTime`/`Friend` không persist vào Mongo**. "All friends" vẫn
   hiện vì đọc Redis. `GetFriendSuggestions` đọc **Mongo** lọc `AcceptTime != null` → thấy 0 bạn
   accepted → rỗng.
   - **Fix:** `AcceptFriend.cs` lấy `senderId` từ **DB entity** (không phụ thuộc cache), null-safe
     toàn bộ phần sync cache; bỏ dead `using Newtonsoft.Json` + `_notificationProcessor` (chính
     `JsonConvert` cũ gây log "Self referencing loop"). `AddFriend.cs` null-guard cache sender/receiver
     + guard `Contact not found`; bỏ `_notificationProcessor`.
   - **Dữ liệu cũ:** quan hệ đã "accept" qua flow lỗi đang có `AcceptTime=null` trong Mongo →
     script `scripts/backfill_accept_time.py` (đối chiếu Redis `FriendStatus='friend'`, **dry-run mặc
     định**, `--apply` để ghi). Người dùng tự review + chạy (DB cloud).
2. **`_userCache.GetInfo(...)` thiếu `await`** trong `AddFriend`/`RemoveFriend` → trả `Task` (luôn
   `!= null`) ⇒ guard "chỉ khi online" vô hiệu. Đã thêm `await`.
3. **Bỏ poll `/friends` ở trang Connections** (`useFriend()` không `refetchInterval`).
4. **Fix `/ping` double-call** khi reload: `usePresencePing` thêm ref guard chống double-invoke của
   React `StrictMode` (`hooks/usePresencePing.ts`).
5. **Đổi màu hồng → xanh chủ đạo** `light-blue-500` (#0ea5e9, khớp sidebar/nút Chat) cho toàn bộ
   accent trang Connections (tabs active, badge, toggle Online/A-Z, icon header/section, focus search).

## Cần lưu ý / việc còn lại

- ⚠️ **Restart backend** để nạp bản fix mới (binary đang chạy là bản cũ — log còn `JsonConvert` ở
  AcceptFriend mà source đã bỏ; endpoint `/friends/suggestions` mới cũng cần build mới). `CreateDirectConversation.cs`
  body-optional cũng cần bản này.
- ⚠️ **Backfill `AcceptTime`** cho dữ liệu cũ: `python3 scripts/backfill_accept_time.py` (xem trước)
  → `--apply` (ghi). Bắt buộc để suggestion dùng được bạn bè hiện có làm "cầu nối".
- ⚠️ **Index Mongo** `Friend.FromContact.ContactId` & `Friend.ToContact.ContactId` để
  `GET /friends/suggestions` không full-scan khi scale.
- **Tradeoff presence:** đã bỏ poll → online/offline không realtime (FCM không đẩy presence). Muốn
  realtime presence phải đẩy event qua FCM.
- Realtime friend chỉ foreground (FCM). Nếu phía nhận offline lúc thao tác, BE bỏ qua cập nhật cache
  họ (guard `is not null`) — đồng bộ lại khi họ load/login.
- Chưa làm (out of scope đã chốt): Block/Unblock, sinh nhật (cần field `DateOfBirth`).

## Lệnh

```bash
cd client && npm run build && npm run lint     # frontend
dotnet build                                    # backend
dotnet run --project Chat.API                   # restart backend (nạp fix)
python3 scripts/backfill_accept_time.py         # backfill AcceptTime — dry-run
python3 scripts/backfill_accept_time.py --apply # backfill AcceptTime — ghi thật
```
