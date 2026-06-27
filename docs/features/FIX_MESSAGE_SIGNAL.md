# Fix: tín hiệu tin nhắn — badge lệch + không nhận được tin

> MODE: FRONTEND. Hai lỗi realtime: (1) bộ đếm trên icon Conversations lệch với danh
> sách; (2) có tin nhắn user không nhận được.

## 1. Trạng thái

| Hạng mục | Trạng thái |
|---|---|
| Root cause (4 lỗi) | ✅ Xác định |
| Fix FE | ✅ Xong |
| Kiểm thử mô phỏng (util thật) | ✅ 7/7 PASS |
| `tsc --noEmit` | ✅ Sạch (3 lỗi pre-existing) |

## 2. Root cause & Fix

| # | Lỗi | Root cause | Fix |
|---|---|---|---|
| 1 | Hội thoại từ người/nhóm **MỚI** không hiện | `buildConvFromMessage` không gắn `members` → filter membership ở `ListchatContent` lọc ẩn hội thoại mới | Gắn `members: message.members` (payload `NewMessage` vốn có sẵn) + `unSeen` + `lastMessageId` |
| 2 | Badge **không đếm** hội thoại mới | conv mới dựng thiếu `unSeen` | Truyền `unSeen: !isActive` vào `buildConvFromMessage` |
| 3 | Badge **kẹt cao** (overcount) | `updateConversationCache` dùng `...(patch.unSeen && …)` → boolean `false` bị bỏ qua → `unSeen` không bao giờ về `false` | Đổi sang `patch.unSeen !== undefined` |
| 4 | Badge **lệch** list (đếm cả hội thoại đã rời) | badge đếm `conversations.filter(unSeen)` KHÔNG áp filter membership như list | `useUnseenConversationCount` thêm điều kiện `members.some(me && !isDeleted)` — cùng tập với list |
| 5 | ~~Tin đến lúc tab **nền** bị mất~~ | Realtime **chỉ qua FCM `onMessage` (foreground)**; tab nền → SW không cập nhật cache | 🗑️ **Đã gỡ** — catch-up `visibilitychange/focus → invalidate` gây **loading hiện mỗi lần focus** (UX xấu). Để triệt để xem §5 (chuyển message events sang SignalR). |

## 3. File thay đổi

| File | Thay đổi |
|---|---|
| `utils/notificationHandlers.ts` | `buildConvFromMessage(message, unSeen)` gắn members/unSeen/lastMessageId; branch new-conv dùng newConv + prepend đúng `filterConversations` |
| `utils/notificationCacheHelpers.ts` | `updateConversationCache`: `patch.unSeen !== undefined` (set được `false`) |
| `hooks/useUnseenConversationCount.ts` | đếm cùng filter membership với list |
| `context/SignalContext.tsx` | (đã revert catch-up refetch — gây loading khi focus) |

## 4. Kiểm thử (mô phỏng, util thật)

Nạp đúng `notificationCacheHelpers.ts` (esbuild bundle) + replica predicate badge/list:
- `updateConversationCache` set được `unSeen=false` và `true`.
- Hội thoại mới (members có ME + unSeen) → badge đếm **và** list hiển thị/tô đỏ.
- **badge == số unread NHÌN THẤY trong list** qua 5 case biên (member/đã rời/không phải
  member/đã đọc/thiếu members). → 7/7 PASS.

## 5. Ghi chú & hướng triệt để hơn (BE)

- Fix #5 là **catch-up** ở client, đủ để không "mất" tin. Triệt để hơn nên đưa **message
  events qua SignalR** (đang có sẵn hub `ciaohub` nhưng chỉ dùng cho WebRTC) thay vì phụ
  thuộc FCM — realtime ổn định, không lệ thuộc quyền notification / độ trễ push.
- Thuần FE, không cần restart BE.

---

## 6. Bổ sung: badge=1 nhưng list không có cái nào đỏ (đã fix)

**Triệu chứng:** badge Conversations = 1 nhưng không conversation nào hiển thị chưa đọc.

**Root cause:** conversation **đang mở** (active) nhận tin mới lúc đang xem, nhưng
`isConversationActive` lỡ trả `false` (race) → `onNewMessage` set `unSeen=true`. List tô
conversation active màu **xám** (`id === conversationId`) chứ không đỏ → nhìn như đã đọc;
badge vẫn đếm `unSeen=true` → lệch. Route loader chỉ clear lúc MỞ, tin đến SAU set lại.

**Fix:** clear `unSeen` đúng tại thời điểm `markRead` (user đã đọc tin cuối) — `Chatbox`
gọi `markConversationSeen(cache, conversationId)` (helper mới ở `notificationCacheHelpers`,
clear cả `conversations` + `filterConversations`, no-op nếu đã seen). Tự sửa mọi race vì
markRead re-fire khi `messages` đổi → trong 1s sau khi tin tới + ở đáy là clear.

**Kiểm thử:** harness tái hiện đúng bug (badge=1/list 0 đỏ) → sau fix badge=0, `badge ==
visible red`. 7/7 PASS.

| File | Thay đổi |
|---|---|
| `utils/notificationCacheHelpers.ts` | + `markConversationSeen(cache, conversationId)` |
| `components/conversation/Chatbox.tsx` | `markRead` → kèm `markConversationSeen` clear unSeen cache |
