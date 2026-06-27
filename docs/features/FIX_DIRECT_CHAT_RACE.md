# Fix: click friend online → conversations không thấy hội thoại (race tạo direct chat)

> MODE: FRONTEND. Bug: từ dashboard click 1 friend online (chưa từng có hội thoại) →
> điều hướng sang `/conversations/$id` nhưng **không thấy hội thoại**. Cùng bug ở nút
> Chat trang Connections.

## 1. Trạng thái

| Hạng mục | Trạng thái |
|---|---|
| Root cause (BE async persist + FE invalidate race) | ✅ Xác định |
| Fix FE optimistic cache (hook dùng chung) | ✅ Xong |
| Kiểm thử mô phỏng (util thật) | ✅ 11/11 PASS |
| `tsc --noEmit` | ✅ Sạch (3 lỗi pre-existing không liên quan) |

## 2. Root cause

| Tầng | Chi tiết |
|---|---|
| **BE** | `CreateDirectConversation` **không persist đồng bộ**: tạo `Conversation` in-memory → đẩy Kafka `Topic.NewDirectConversation` (consumer lưu Mongo **bất đồng bộ**) → trả `conversationId` ngay. |
| **FE** | `ChatboxContainer`/`ChatboxHeader` lấy conversation từ **cache list `["conversation"]` theo id**. Nếu không có → render trống. |
| **Race** | Sau create, code cũ gọi `invalidateQueries(["conversation"])` → refetch `getConversations` **trước khi** consumer lưu xong → list **chưa có** hội thoại mới → ChatboxContainer không tìm thấy. Tệ hơn: refetch còn **ghi đè** mất state. |

## 3. Fix

Bỏ `invalidateQueries`; thay bằng **optimistic insert theo id thật** (đúng pattern
`FriendCtaButton` đã dùng) — không phụ thuộc thời điểm consumer persist; refetch tự
nhiên về sau (staleTime 1h) reconcile theo id.

- **Mới:** `client/src/hooks/useOpenDirectChat.ts` — `createDirectChat` → `setQueryData(["conversation"])` chèn `buildOptimisticConversation(realId, me, contact)` qua `prependConversation` (chỉ chèn khi CHƯA có để không clobber entry richer) → `navigate`.
- **Sửa:** `HomeOnlineFriends.tsx`, `ConnectionChatButton.tsx` → dùng hook, bỏ logic `invalidateQueries` cũ.
- **Không đụng:** `FriendCtaButton.tsx` (vốn đã optimistic đúng).

## 4. Kiểm thử (mô phỏng)

Harness nạp **đúng `conversationCache.ts` thật** (esbuild bundle) + replica updater của
hook, kiểm tra cách `ChatboxContainer`/`Header` tra cứu:

- cache rỗng/undefined → tìm thấy conv mới ở cả `conversations` + `filterConversations`;
  `otherMember` đúng là người kia → header hiện đúng tên/avatar đối phương.
- đã có hội thoại khác → prepend, không mất cái cũ.
- conv đã tồn tại (richer, có `lastMessage`) → **không clobber**.
- điều hướng tới đúng `conversationId` BE trả về.

→ **11/11 PASS.**

## 5. Lưu ý vận hành

- Thuần FE, không cần đổi BE / restart BE.
- Dev server FE đã chạy (HMR tự nạp). Nếu cần: hard reload tab.
- Giới hạn: nếu user gửi tin trước khi consumer persist, flow gửi tin đã có optimistic
  riêng (xem `useDirectMessage`) — không nằm trong phạm vi bug này.
