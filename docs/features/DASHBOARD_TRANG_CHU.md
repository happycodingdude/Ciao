# Tính Năng Dashboard (Trang Chủ)

## Mục đích

Dashboard (`/` → `Home`) là màn hình tổng quan sau khi đăng nhập, gom các thông tin quan trọng nhất vào một nơi:

- Lời chào + trạng thái bản thân
- Thống kê nhanh (unread, friends online, requests, friends)
- Lối tắt thao tác (quick actions)
- Danh sách hội thoại gần đây ("Continue chatting")
- Danh sách bạn bè đang online ("Friends online")
- Lời mời kết bạn đang chờ (pending requests)

Trọng tâm khác biệt của Dashboard là **hiển thị trạng thái online real-time** của bạn bè, nên phần lớn tài liệu này nói về cách presence được lấy và cập nhật.

---

## Cấu trúc component

`client/src/pages/Home.tsx` là container, lắp ráp 6 component con trong `client/src/components/home/`:

| Component | Vai trò | Nguồn dữ liệu |
|---|---|---|
| `HomeHero` | Avatar, tên, trạng thái bản thân, badge unread | `useInfo()` |
| `HomeStats` | 4 ô số liệu (unread / online / requests / friends) | dẫn xuất từ conversations + friends |
| `HomeQuickActions` | Các nút lối tắt | tĩnh |
| `HomeRecentChats` | Lưới hội thoại gần đây + status dot | `useConversation()` (data) + `onlineFriendIds` (presence) |
| `HomeOnlineFriends` | Hàng avatar bạn bè đang online, click để mở chat | `useFriend()` |
| `HomePendingRequests` | Lời mời kết bạn chờ duyệt, accept/deny | `useFriend()` |

`Home.tsx` tính toán các danh sách dẫn xuất bằng `useMemo` để tránh re-render thừa:

- `recentChats`: hội thoại có `lastMessageTime`, sort giảm dần, lấy `RECENT_LIMIT = 6`.
- `unreadCount`: số hội thoại `unSeen`.
- `onlineFriends`: bạn bè có `friendStatus === "friend" && isOnline`.
- `onlineFriendIds`: `Set<string>` id bạn bè đang online — **nguồn presence duy nhất** dùng chung cho Dashboard.
- `pendingRequests`: friend có `friendStatus === "request_received"`.
- `totalFriends`: số friend có `friendStatus === "friend"`.

---

## Luồng dữ liệu presence (online/offline)

Đây là phần cốt lõi. Trạng thái online **không** lưu tĩnh mà được tính từ Redis presence theo cơ chế heartbeat.

### 1. Client gửi heartbeat

`client/src/hooks/usePresencePing.ts` (mount 1 lần ở `_layout`) gọi `GET /presence/ping` mỗi **30s**, **bất kể tab đang focus hay chạy nền**.

- "Online" = app đang mở (kể cả tab nền), không phải "tab đang focus".
- Khi tab đóng hẳn → ngừng ping → user tự offline sau khi quá ngưỡng (đúng kỳ vọng).

### 2. Server ghi nhận hoạt động

`PresencePing` → `IPresenceService.UpdateActivityAsync(userId)` → ghi `userId` với score = timestamp hiện tại vào Redis Sorted Set `online_users`.

### 3. Server xác định online

`IPresenceService.IsOnlineAsync(userId)`: lấy score của user, trả `true` nếu `now - score < 60s` (`OnlineThresholdSeconds`). Đây là **single source of truth** cho toàn hệ thống (cả `/conversations` lẫn `/friends` đều dùng).

### 4. API /friends trả presence động

`GET /friend` → `GetListFriend` → đọc friend list từ cache → `UserCache.SyncUserInfo()` ghi đè `contact.isOnline` cho từng friend bằng `IsOnlineAsync(friend.Contact.Id)`.

### 5. Dashboard poll định kỳ

`Home.tsx` gọi `useFriend({ refetchInterval: 30_000 })`:

```ts
const { data: friendCache } = useFriend({ refetchInterval: 30_000 });
```

- Poll lại `/friends` mỗi **30s** (khớp ngưỡng presence 60s) → trạng thái online cập nhật lên UI trong ≤30s.
- `refetchIntervalInBackground: true`: vẫn poll khi tab mất focus, nên khi quay lại tab đã thấy trạng thái mới (không bị đứng yên).
- Chỉ Dashboard truyền `refetchInterval`; các caller khác của `useFriend` (modal forward/add member/create group) giữ nguyên `staleTime: Infinity`, không bị ảnh hưởng.

### 6. Logout → offline tức thì

`SignOut` gọi `IPresenceService.SetOfflineAsync(userId)` → `SortedSetRemoveAsync("online_users", userId)`, xóa user khỏi presence ngay khi đăng xuất thay vì chờ score hết hạn 60s. Bên còn lại thấy offline ở lần poll kế tiếp (≤30s).

---

## Status dot ở "Continue chatting"

`HomeRecentChats` **không** đọc `isOnline` từ conversation cache (cache này không được poll nên trạng thái sẽ đứng yên). Thay vào đó nó nhận `onlineFriendIds` (Set đã poll từ `/friends`) và tự tính:

```ts
const isOnline = (item.members ?? []).some(
  (m) =>
    m.contact?.id !== selfId &&
    m.contact?.id != null &&
    onlineFriendIds.has(m.contact.id),
);
```

Nhờ vậy mọi icon trạng thái trên Dashboard dùng **cùng một nguồn presence** và cùng cập nhật theo nhịp poll 30s.

---

## Hợp đồng dữ liệu `/friends`

Mỗi item trả về có dạng (đã được làm self-contained ở `contact`):

```jsonc
{
  "id": "<friendRelationId>",
  "status": "friend",
  "contact": {
    "id": "<contactId của bạn bè>",
    "name": "...",
    "avatar": "...",
    "isOnline": true,
    "friendId": "<friendRelationId>",
    "friendStatus": "friend",            // "friend" | "request_sent" | "request_received"
    "directConversation": "<convId|null>"
  }
}
```

> Lưu ý: các field quan hệ (`friendStatus`, `friendId`, `directConversation`) được populate vào `contact` ở backend (`GetListFriendItem_Contact` + `MyMapping.AfterMap`) để frontend đọc nhất quán qua `f.contact.*`, đồng bộ với optimistic update trong `Home.handleFriendAction`.

---

## Hành vi UI

- **HomeOnlineFriends**: chỉ liệt kê bạn bè đang online (avatar có vòng + chấm xanh). Click một avatar:
  - Nếu `contact.directConversation` đã có → điều hướng thẳng tới hội thoại.
  - Nếu chưa → gọi `createDirectChat(contact.id)`, invalidate cache `["conversation"]`, rồi điều hướng.
  - Có chặn double-click bằng `openingId`.
- **HomePendingRequests**: accept/deny lời mời. Sau thao tác, `handleFriendAction` cập nhật optimistic cache `["friend"]` để list phản hồi ngay, lần poll kế tiếp đồng bộ với server.
- **Empty states**: mỗi section có thông báo riêng khi rỗng (vd "None of your friends are online right now.").

---

## Lưu ý vận hành

- **Tham số thời gian** (đổi cần cân nhắc đồng bộ):
  - Presence threshold: `OnlineThresholdSeconds = 60` (`PresenceService`).
  - Ping interval: `PING_INTERVAL = 30s` (`usePresencePing`). Bắt buộc `< 60s` để giữ online.
  - Dashboard poll: `refetchInterval = 30s` (`Home.tsx`).
  - Quy tắc: `ping < threshold` và `poll ≤ threshold` để trạng thái không nhấp nháy.
- **Cache response**: `getFriends` gửi header `Cache-Control: no-cache` để tránh browser/ngrok trả bản cũ khiến presence "đứng yên".
- **Sau khi đổi backend** (mapping/presence): phải restart API (`dotnet run --project Chat.API`) thì thay đổi mới có hiệu lực; frontend hard-reload (Ctrl/Cmd+Shift+R) để xóa cache cũ.

---

## Giới hạn hiện tại & hướng nâng cấp

- Mô hình hiện tại là **pull/heartbeat**: độ trễ tối đa ~ ngưỡng 60s + 1 nhịp poll 30s. Đủ tốt cho quy mô vừa.
- Mỗi user mở Dashboard tạo 1 request `/friends`/30s; mỗi request gọi N lần `IsOnlineAsync` (Redis, rẻ).
- **Khi scale lớn / cần real-time tức thì**: chuyển presence sang **push qua SignalR** (`SignalHub` đã có sẵn connection tracking) — broadcast khi có transition online↔offline rồi patch trực tiếp cache `["friend"]`, bỏ polling. Đây là thay đổi lớn, chưa triển khai.

---

## Kiểm thử nhanh

1. Đăng nhập 2 tài khoản là bạn của nhau (2 cửa sổ/thiết bị).
2. Mở Dashboard cả hai → mỗi bên thấy bên kia trong "Friends online", status dot ở "Continue chatting" màu xanh.
3. Mở DevTools → Network: response `/friends` mỗi item có `contact.friendStatus` và `contact.isOnline`.
4. Logout 1 bên → trong ≤30s bên kia thấy biến mất khỏi "Friends online" và status dot chuyển xám.

---

## File liên quan

**Frontend**
- `client/src/pages/Home.tsx` — container + dẫn xuất dữ liệu + poll.
- `client/src/components/home/*` — các section UI.
- `client/src/hooks/useFriend.ts` — query `/friends` (+ polling tùy chọn).
- `client/src/hooks/usePresencePing.ts` — heartbeat presence.
- `client/src/services/friend.service.ts` — `getFriends` (header no-cache).

**Backend**
- `Presentation/Friend/GetListFriend.cs` — endpoint `/friend`.
- `Application/Caching/UserCache.cs` — `SyncUserInfo` ghi đè `isOnline` theo presence.
- `Application/Services/IPresenceService.cs` + `Infrastructure/Services/PresenceService.cs` — presence service (Redis sorted set).
- `Presentation/Contact/PresencePing.cs` — endpoint `/presence/ping`.
- `Presentation/Identity/SignOut.cs` — `SetOfflineAsync` khi logout.
- `Application/DTOs/FriendDTO.cs` + `Infrastructure/Mapping/MyMapping.cs` — DTO contact self-contained.
