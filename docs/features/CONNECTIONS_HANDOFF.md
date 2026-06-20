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
   `useFriend({ refetchInterval: 30_000 })` (poll presence 30s). Mọi tab phái sinh status từ cache
   này — kể cả **tab Add** (search results lấy identity từ `getContacts`, nhưng status nút map từ
   cache `relByContactId`; không có trong cache → `"new"`). Đây là fix cho bug "deny không flip nút".

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

## Cần lưu ý / việc còn lại

- ⚠️ **Restart backend** sau khi sửa `CreateDirectConversation.cs` (body optional) để nút Chat hết lỗi
  `BadHttpRequestException: Implicit body inferred`.
- ⚠️ **Vận hành**: nên tạo index Mongo `Friend.FromContact.ContactId` & `Friend.ToContact.ContactId`
  để `GET /friends/suggestions` không full-scan khi scale.
- Realtime chỉ foreground (FCM). Nếu phía nhận offline lúc thao tác, BE bỏ qua cập nhật cache họ
  (guard `if receiver is not null`) — nhận khi online lại qua poll.
- **Chưa commit**: toàn bộ thay đổi đang ở working tree (chưa `git commit`). Phase 1 đã được commit
  trước đó (`9622371`); Phase 2/3 + fixes nằm trên working tree.
- Chưa làm (out of scope đã chốt): Block/Unblock, sinh nhật (cần field `DateOfBirth`).

## Lệnh

```bash
cd client && npm run build && npm run lint   # frontend
dotnet build                                  # backend
```
