# Fix: Rời nhóm → vào lại bằng link → không hiện hội thoại / mất tin nhắn

> **Trạng thái:** 🟠 Fix một phần (2026-07-13) — hội thoại đã hiện lại, nhưng **còn 2 lỗi chưa xử lý** (xem mục 5)
> **Liên quan:** [`ROI_NHOM.md`](./ROI_NHOM.md) · [`LINK_MOI_VA_YEU_CAU_THAM_GIA.md`](./LINK_MOI_VA_YEU_CAU_THAM_GIA.md)

---

## 1. Triệu chứng (user báo)

| # | Bug |
| --- | --- |
| 1 | User vừa **leave** rồi **rejoin** qua link → **không** thấy hội thoại vừa vào lại trong danh sách |
| 2 | Sau khi rejoin và **reload** trang → hội thoại hiện ra, nhưng **click vào không có bất kỳ tin nhắn nào** |

---

## 2. Root cause

Đường **đọc dữ liệu là cache-only**. Message cache (Redis) chỉ được build đầy đủ từ Mongo lúc `user.login`,
mà `SignIn` chỉ phát `user.login` khi `!user.IsOnline`. Reload trang **không** re-signin ⇒ không rebuild cache.
Luồng rejoin chỉ `AddSystemMessage` (append 1 dòng hệ thống) chứ **không** nạp lại lịch sử từ Mongo.

- **Bug #2 — mất tin nhắn:** `GetMessages.Handle` đọc **duy nhất** từ message cache, **không fallback Mongo**
  và **không null-guard** (khác `GetMessagesAround` vốn có guard) → cache lạnh/rỗng cho hội thoại vừa rejoin
  ⇒ `message.OrderByDescending(...)` ném NRE (500) hoặc trả rỗng. Mongo vẫn còn đủ tin (rời nhóm không xoá message),
  chỉ là đường đọc không chạm tới.
- **Bug #1 — không hiện hội thoại:** persist "joined" là **async qua Kafka** (reopen member). `Invite.tsx` gọi
  `invalidateQueries(["conversation"])` **ngay** → refetch đọc **cache cũ** (self-member vẫn `IsDeleted=true`) →
  `ListChatContainer` lọc bỏ (chỉ hiện hội thoại có self-member `!isDeleted`). Cơ chế tự lành duy nhất là event
  realtime `NewMembers` — nhưng **FCM-only**, user đang navigate /invite→/conversations nên rất dễ miss.
  Thêm nữa `createNewConversation` tạo hội thoại **không kèm `members`** → dù nhận được event mà hội thoại chưa
  nằm trong list thì vẫn bị lọc ẩn.

---

## 3. Thay đổi

### Backend
- `Application/Caching/MessageCache.cs` — thêm `SetMessages(...)` để warm lại toàn bộ message cache của hội thoại.
- `Presentation/Conversation/GetMessages.cs` — khi cache `null`/rỗng, **fallback đọc Mongo** (`LoadFromStoreAndWarmCache`):
  map `Message → MessageWithReactions`, tính sẵn reaction count, **warm lại cache**, rồi trả kết quả. Recall đã
  clear Content/Attachments ở Mongo nên không lộ nội dung thu hồi. Đây là fix production-grade: mọi hội thoại có
  cache bị evict cũng tự lành thay vì hiện trống.

### Frontend
- `client/src/utils/notificationCacheHelpers.ts` — `createNewConversation` nhận thêm `members` (bắt buộc kèm khi biết);
  đồng thời sửa lỗi copy-paste `filterConversations` (trước spread nhầm từ `conversations`, làm reset filter/search đang active).
- `client/src/utils/notificationHandlers.ts` — `onNewMembers` nhánh hội thoại-chưa-có truyền `conversation.members`
  vào `createNewConversation` → hội thoại vừa vào lại qua list-filter, hiện ngay.
- `client/src/pages/Invite.tsx` — sau "joined" lặp lại `invalidateQueries(["conversation"])` ở các mốc `0/800/2000/4000ms`
  để chắc chắn kéo được trạng thái đã reopen từ server dù event FCM `NewMembers` bị miss lúc điều hướng.

---

## 4. Checklist nghiệm thu (user verify trên app thật)

| # | Luồng | Kết quả mong đợi |
| --- | --- | --- |
| 1 | User leave nhóm, rồi mở link mời và bấm **Join group** (không cần reload) | Hội thoại xuất hiện lại trong danh sách trong ~vài giây |
| 2 | Ngay sau khi rejoin, mở hội thoại đó | Toàn bộ lịch sử tin nhắn hiển thị đầy đủ (kèm dòng "joined via invite link") |
| 3 | Rejoin xong **reload** trang rồi click hội thoại | Tin nhắn hiển thị đầy đủ (không còn trống) |
| 4 | (Hồi quy) Mở một hội thoại bình thường bất kỳ | Tin nhắn hiển thị như cũ, không đổi hành vi |
| 5 | (Hồi quy) Nhóm bật duyệt: xin vào → admin duyệt | Người xin thấy hội thoại + đủ tin nhắn sau khi được duyệt |

---

## 5. ⚠️ Lỗi CÒN TỒN (chưa xử lý — sẽ back lại sau)

> Ghi nhận 2026-07-13 sau khi user test bản fix ở mục 3. Fix mục 3 (BE fallback + FE list-visibility)
> đã giúp hội thoại hiện ra, nhưng vẫn còn 2 vấn đề dưới đây.

### 5.1 Rejoin xong click hội thoại vẫn KHÔNG hiện tin nhắn — dù API `GET messages` ĐÃ trả về data

- **Điểm mấu chốt:** đây **KHÔNG còn là lỗi BE** — network response của `GET /conversations/{id}/messages`
  đã có đủ tin nhắn. Vấn đề nằm ở **FE render/cache**: data về nhưng không đổ ra UI.
- **Hướng nghi ngờ (chưa xác minh):**
  - Message cache FE là **InfiniteData** — phải cập nhật qua helper `client/src/utils/messageCache.ts`,
    không set phẳng. Có thể query `["messages", conversationId]` (hoặc key tương đương) đang giữ một trang
    **rỗng cũ** (từ lúc trước rejoin cache BE còn lạnh) và **không refetch/replace** khi mở lại → UI đọc cache rỗng.
  - Hoặc `Chatbox`/`useMessages` đọc messages theo `conversation.selected`/active-conversation state chưa
    khớp sau rejoin (conversation object thiếu field cần để trigger fetch/render).
  - Cần kiểm: React Query có `data` cho key messages không → nếu có mà UI trống thì là lỗi map InfiniteData→render;
    nếu query không active/không refetch thì là lỗi invalidate cache messages sau rejoin.
- **Việc cần làm:** sau rejoin, **invalidate/refetch cache messages** của hội thoại đó (không chỉ cache `["conversation"]`),
  và đảm bảo path render đọc đúng InfiniteData. Xem [[project-conversations-infinite-query]].

### 5.2 Chưa có thông báo (notification) khi 1 user join nhóm qua link

- Hiện luồng "vào thẳng bằng link" (`JoinByInvite` ViaInvite, không cần duyệt) **không tạo Notification**
  cho quản trị/thành viên nhóm (chỉ nhánh `RequireApproval` mới tạo notification "requested to join").
- **Việc cần làm:** khi có người vào nhóm qua link, tạo Notification bền (SourceType phù hợp, vd. thành viên mới)
  cho quản trị (hoặc cả nhóm) + FCM event, tái dùng hạ tầng notification sẵn có ở `NotificationConsumer`.
  Cân nhắc gộp với dòng system message "joined via invite link" đã có.
