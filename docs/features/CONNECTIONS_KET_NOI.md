# Kế Hoạch Tính Năng — Connections (Kết nối / Quan hệ bạn bè)

> Trạng thái: **PLAN — chờ duyệt để implement**
> Scope đã chốt: **Phase 1 + Phase 2 + Phase 3** (KHÔNG làm Block/Unblock). Add friend = **tab riêng trong trang**.

## Mục đích

`Connections` (`/connections` → `Connection.tsx`) hiện đang trống. Đây sẽ là trung tâm quản lý
quan hệ: danh sách bạn bè, bạn đang online, lời mời kết bạn (nhận & đã gửi), và thêm bạn mới.

Khác biệt với Dashboard: Dashboard chỉ *tóm tắt* (online + pending). Connections là nơi **quản lý
đầy đủ** — duyệt/từ chối/huỷ lời mời, huỷ kết bạn, tìm & thêm bạn, lọc/sắp xếp.

---

## Khảo sát sản phẩm phổ biến (định hướng UX)

| App | Mô hình tham chiếu |
|---|---|
| **Discord** | Tabs `Online / All / Pending / Blocked` + ô **Add Friend** → khuôn mẫu chính |
| **Zalo** | Danh bạ nhóm A-Z, "Lời mời kết bạn", sinh nhật |
| **Messenger** | Hàng "Active now" (chấm xanh) + Friend requests |
| **Telegram** | Contacts A-Z, "last seen", add/invite |

Tinh chắt: segmented tabs · presence dot · per-item actions (Chat / Profile / Unfriend) ·
badge đếm pending · search · empty state.

---

## Hiện trạng backend (đã verify)

`GET /friends` trả về **toàn bộ** quan hệ kèm `friendStatus` + presence → phần lớn UI dựng được
không cần backend mới.

| Năng lực | Endpoint | Trạng thái |
|---|---|---|
| List quan hệ + presence | `GET /friends` | ✅ |
| Gửi lời mời | `POST /friends/{contactId}` | ✅ |
| Chấp nhận | `PUT /friends/{id}` | ✅ |
| Huỷ lời mời **mình gửi** | `DELETE /friends/{id}` | ⚠️ chỉ `FromContact` & chưa accept |
| **Từ chối** lời mời nhận | — | ❌ validator chặn non-sender |
| **Huỷ kết bạn** (đã accept) | — | ❌ validator `NotYetAccepted` chặn |
| Tìm contact để add | `GET /contacts?name=` | ✅ |

> 🔴 Gap: `CancelFriend` có 2 guard `MustBeSender` + `NotYetAccepted` ⇒ người **nhận không
> từ chối được**, và **không ai huỷ kết bạn được**. `DenyButton.jsx` ở frontend hiện không có
> backend tương ứng. → Xử lý ở Phase 2.

`friendStatus`: `"friend" | "request_sent" | "request_received" | "new"`.

---

## Phase 1 — Frontend MVP (không đụng backend) ✅ ĐÃ XONG

> Đã implement & verify (`npm run build` pass, lint sạch ở file mới). Files: `client/src/pages/Connection.tsx`,
> `client/src/components/connection/*`, `client/src/types/connection.types.ts`, route `_layout.connections.tsx`
> (thêm `validateSearch`), deep-link từ `HomeStats`/`HomeQuickActions`.

### Component (mới, trong `client/src/components/connection/`)

| Component | Vai trò | Nguồn dữ liệu |
|---|---|---|
| `ConnectionTabs` | Segmented control `All / Online / Requests / Add` + badge đếm | props counts |
| `ConnectionFriendList` | List bạn (online-first), search/filter inline, mỗi item có Chat + overflow menu | `useFriend()` |
| `ConnectionRequests` | 2 section: **Nhận được** (Accept/Deny) + **Đã gửi** (Cancel) | `useFriend()` |
| `AddFriendPanel` | Ô search contacts → `FriendItem` + `AddButton` | `getContacts()` |
| `ConnectionEmpty` | Empty state dùng chung từng tab | tĩnh |

`Connection.tsx` = container: dựng layout `max-w-5xl` đồng bộ Home, gọi
`useFriend({ refetchInterval: 30_000 })`, tính các danh sách dẫn xuất bằng `useMemo`:

- `friends`: `friendStatus === "friend"` (online-first sort).
- `onlineFriends`: `friend && isOnline`.
- `incoming`: `request_received`.
- `outgoing`: `request_sent`.
- `counts`: cho badge tab (đặc biệt badge số lời mời nhận).

### Tái sử dụng (không viết lại)
`FriendItem`, `FriendCtaButton`, `AcceptButton`, `CancelButton`, `AddButton`, `useFriend`,
`getContacts`, helper optimistic cache `["friend"]` (theo đúng pattern `handleFriendAction`
đã có trong `Home.tsx`).

### Tab state qua URL search param
Dùng search param `?tab=all|online|requests|add` (TanStack Router) để:
- Deep-link từ Dashboard: 3 ô stat (`Friends online`, `Requests`, `Friends`) đang trỏ
  `/connections` → trỏ thẳng tab tương ứng (`?tab=requests`...).
- Giữ state khi refresh / chia sẻ link.

### Hành động chưa có backend
Deny / Unfriend ở Phase 1 **ẩn hoặc disable** (không wiring giả). Bật lên ở Phase 2.

### Validation Phase 1
Re-render thừa (memo hoá danh sách + tab); optimistic update đúng key `["friend"]`;
responsive (mobile 1 cột); empty state mỗi tab; không đổi behavior Dashboard.

---

## Phase 2 — Backend: Deny + Unfriend ✅ ĐÃ XONG

> Đã implement & build (BE `dotnet build` 0 errors, FE build/lint sạch).
> BE: `Presentation/Friend/RemoveFriend.cs` (thay `CancelFriend.cs`), event constants `FriendRequestDenied`/`Unfriended`.
> FE: `services/friend.service.ts#removeFriend`, `components/connection/DenyButton.tsx` + `UnfriendMenu.tsx` (confirm popover), wire trong `ConnectionContact`. Đã xoá `DenyButton.jsx` legacy hỏng.

### Quyết định thiết kế
Thay vì nới lỏng `CancelFriend` (làm rối ngữ nghĩa), **tổng quát hoá** thành một command
`RemoveFriend` đứng sau `DELETE /friends/{id}`, phân nhánh theo vai trò + trạng thái:

| Trường hợp | Ai được phép | Điều kiện | Notification event |
|---|---|---|---|
| Cancel (huỷ lời mời gửi) | `FromContact` | chưa accept | `FriendRequestCanceled` (giữ nguyên) |
| **Deny** (từ chối) | `ToContact` | chưa accept | `FriendRequestDenied` (mới) |
| **Unfriend** | `FromContact` hoặc `ToContact` | đã accept | `Unfriended` (mới) |

- Validator mới: `MustBeParticipant` (thay `MustBeSender`); bỏ `NotYetAccepted` cứng, thay
  bằng logic phân nhánh ở handler.
- Giữ nguyên: cập nhật `FriendCache` **2 phía** + push notification như `CancelFriend` đang làm.
- **Backward-compatible**: frontend gọi `DELETE` để cancel vẫn chạy y hệt.
- Backend risk checklist: idempotency (xoá doc đã mất → trả OK, không throw), 2-sided cache
  nhất quán, notification gửi đúng người còn lại.

### Frontend Phase 2
- Bật `DenyButton` (incoming) + thêm action **Unfriend** trong overflow menu của `FriendItem`.
- Service: reuse `DELETE /friends/{id}` (thêm `denyFriend` / `unfriend` wrapper cho rõ ý nghĩa).
- Optimistic: xoá khỏi cache `["friend"]`; confirm dialog cho Unfriend.

---

## Phase 3 — Chiến lược (nâng cao) ✅ ĐÃ XONG

> Đã implement & build sạch.
> A-Z: `ConnectionFriendList` thêm toggle Online-first ↔ A-Z (group chữ cái + header sticky), bật `sortable` cho tab All.
> Mutual suggestions: BE `Presentation/Friend/GetFriendSuggestions.cs` (`GET /friends/suggestions?limit=`), FE hiển thị "People you may know" trong tab Add (`AddFriendPanel`).
> ⚠️ **Vận hành**: nên tạo index Mongo trên `Friend.FromContact.ContactId` & `Friend.ToContact.ContactId` để query suggestions không full-scan khi scale.

| Tính năng | Phạm vi | Phụ thuộc |
|---|---|---|
| **Sort/Group A-Z** + toggle (online-first ↔ A-Z) | Frontend-only | — |
| **Gợi ý kết bạn (bạn chung / mutual)** | Endpoint mới `GET /friends/suggestions` | Mongo graph: index `FromContact.ContactId`, `ToContact.ContactId`; depth=2; **cap kết quả** tránh full scan |

> Phase 3 = **A-Z group/sort** + **mutual suggestions**.
> ~~Sinh nhật~~ — **không làm** (theo yêu cầu); kéo theo schema migration (`DateOfBirth`), chỉ xét lại khi có nhu cầu rõ.

### Rủi ro Phase 3
- `suggestions`: traversal graph có thể đắt → bắt buộc index + limit + projection; cân nhắc cache.

---

## Thứ tự thực thi & Rollback

1. **Phase 1** (rủi ro ~0): thuần frontend, không migration. Rollback = revert FE commit.
2. **Phase 2** (rủi ro thấp): thay `CancelFriend`→`RemoveFriend`, backward-compatible.
   Rollback = giữ endpoint cũ song song nếu cần.
3. **Phase 3 core** (rủi ro TB): endpoint suggestions + sort FE. Rollback độc lập từng phần.

## Realtime (event-driven qua Firebase/FCM)
**Transport:** BE đẩy friend events qua Firebase Cloud Messaging —
`IFirebaseFunction.Notify(event, userIds[], data)` (FCM data-message `{event, data}`). Client nhận
ở `requestPermission` → `onMessage` → `classifyNotification` (đã wire sẵn trong `SignalContext`).
BE: `AddFriend`/`AcceptFriend`/`RemoveFriend` gọi `_firebase.Notify(event, new[]{ otherUserId }, payload)`
(không dùng SignalR/`INotificationProcessor` cho friend nữa).

**Xử lý (`utils/notificationHandlers.ts`) — cập nhật cache `["friend"]` TRỰC TIẾP từ payload
(`friendId`), không refetch:**
- `FriendRequestCanceled`/`Denied`/`Unfriended` → xoá entry theo `friendId`.
- `FriendRequestAccepted` → đổi `friendStatus` entry sang `"friend"`.
- `NewFriendRequest` → refetch `["friend"]` (phía nhận chưa có entry & payload thiếu contact info;
  vẫn do **event** kích hoạt, không phải poll).

Người khởi tạo dùng optimistic update; phía còn lại nhận realtime. Poll 30s giữ làm fallback khi
FCM không tới foreground (mất permission / tab background).

## Trade-off chính
- Presence: tái dùng `refetchInterval: 30_000` + `refetchIntervalInBackground` như Home — không
  phát sinh tải mới, đồng nhất nguồn presence.
- Block/Unblock **không làm** (theo scope) ⇒ không đụng chạm search/chat/presence cross-cutting.
- Tab state qua URL: thêm chút phức tạp routing nhưng đổi lại deep-link từ Dashboard + share link.

## Lệnh vận hành (khi implement)
```bash
# Frontend
cd client && npm run lint && npm run build
# Backend
dotnet build
```
