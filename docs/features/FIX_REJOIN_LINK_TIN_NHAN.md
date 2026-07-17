# Fix: Rời nhóm → vào lại bằng link → không hiện hội thoại / mất tin nhắn

> **Trạng thái:** ✅ ĐÃ NGHIỆM THU trên app thật 2026-07-17 (toàn bộ fix 1→5.6, checklist mục 6)
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

## 5. ✅ Đợt fix 2 (2026-07-13) — xử lý nốt 2 lỗi còn tồn

> Ghi nhận 2026-07-13 sau khi user test bản fix ở mục 3. Cả hai đã fix xong cùng ngày.

### 5.1 Rejoin xong click hội thoại vẫn KHÔNG hiện tin nhắn — dù API `GET messages` ĐÃ trả về data — ✅ ĐÃ FIX

- **Root cause (đã xác minh bằng code-trace + harness, KHÔNG phải các hướng nghi ngờ cũ):**
  UI trống là do **divider "n tin nhắn mới" 2 bước** trong `Chatbox` ẩn TOÀN BỘ tin nhắn:
  1. **BE:** khi rejoin, `CacheConsumer.HandleNewStoredMember` gọi `MemberCache.AddMembers` theo kiểu
     **remove-then-add** — entry member cũ trong Redis (đang giữ `LastSeenTime`, nickname…) bị thay
     bằng entry map từ Kafka model `NewGroupConversationModel_Member` (chỉ có ContactId) ⇒
     **`LastSeenTime` bị reset về `null`** cho self-member.
  2. **FE:** `Chatbox` tính mốc "tin chưa đọc đầu tiên" từ `selfMember.lastSeenTime` — null ⇒ mốc = 0 ⇒
     **mọi tin của người khác đều "chưa đọc"** ⇒ `firstUnreadIndex = 0` ⇒
     `renderedMessages = messages.slice(0, 0) = []` ⇒ khung chat **trống hoàn toàn** dù React Query đã có data
     (chỉ còn banner nhỏ "n tin nhắn mới" nhấp nháy — bấm vào mới hiện tin).
- **Fix:**
  - `Application/Caching/MemberCache.cs` — `AddMembers` chuyển sang **merge in-place**: member đã có entry
    thì reopen tại chỗ (IsDeleted=false, IsNotifying, refresh contact info) và **GIỮ nguyên
    LastSeenTime/LastDelivered*/Nickname/PinnedTime/IsModerator**; member mới thật sự mới append.
    Vẫn idempotent với consumer redelivery, vẫn chống entry trùng (giữ nguyên fix 2026-07-12).
  - `client/src/components/conversation/Chatbox.tsx` — guard "khung chat trống": nếu tin chưa đọc đầu tiên
    là **tin đầu của danh sách đã load** (mốc đã-đọc null/quá cũ) → **auto-reveal** ngay lúc freeze divider:
    hiện đủ lịch sử + vạch "Tin nhắn mới" ở đầu, không giấu tất cả sau banner. Set một lần cùng lúc tính mốc
    nên load-more về sau không làm tin bị ẩn lại đột ngột.
  - `client/src/pages/Invite.tsx` — sau "joined" invalidate thêm cache `["message", conversationId]`
    (ngoài `["conversation"]`) để lần mở đầu tiên refetch fresh, không đọc trang rỗng/cũ còn sót
    (staleTime 120s) từ trước khi rời nhóm hoặc lúc BE cache còn lạnh.
- **Verify:** harness mô phỏng logic merge (BE) + logic divider (FE) — 14 assertion pass, gồm hồi quy
  divider hội thoại thường vẫn ẩn-chờ-reveal đúng thiết kế; build BE + FE pass.

### 5.2 Chưa có thông báo (notification) khi 1 user join nhóm qua link — ✅ ĐÃ FIX (2 đợt)

- **Đợt 1:** nhánh vào-thẳng của `Presentation/Invite/JoinByInvite.cs` tạo **Notification bền cho từng
  quản trị** của nhóm (trừ chính người vào): "{tên} joined {nhóm} via invite link", SourceType mới
  `member_joined` (`Shared/Constants/NotificationSourceType.cs`), kèm ActorName/Avatar/Action/Preview.
- Đặt SAU produce Kafka `NewMember` để join là việc chắc chắn diễn ra trước; save notification lỗi
  không chặn join. Luồng **duyệt** không đi qua đây (quản trị đã có notification `join_request` + kết quả duyệt).
- FE: trang thông báo hiển thị loại mới bằng icon `fa-user-plus` (`utils/notificationDisplay.ts`);
  click notification mở đúng hội thoại (điều hướng theo `sourceId` sẵn có).
- **Đợt 2 — user vẫn báo "không có notification":** soi log BE lượt test thật (21:50:52 13/07) chứng minh
  bản ghi **đã persist** + FCM gửi **thành công** → vấn đề là **kênh hiển thị realtime**: event
  `JoinRequestUpdated` (dùng ở đợt 1) chỉ invalidate cache **âm thầm** — không banner, không toast;
  FCM `onMessage` lại chỉ nhận khi tab foreground (admin đang ở cửa sổ khác lúc joiner bấm Join → miss
  luôn cả invalidate). Quản trị "không thấy gì" trừ khi tự mở trang /notifications.
- **Fix đợt 2:** event FCM riêng **`MemberJoinedByLink`** (payload kèm `conversationId/title/actorName/actorAvatar`):
  - BE `JoinByInvite.cs` + `ChatEventNames.cs` — thay `JoinRequestUpdated` bằng event mới ở nhánh vào thẳng.
  - FE `notificationHandlers.ts` — case mới: refresh badge/list notification + hàng chờ (như JoinRequestUpdated).
  - FE `inAppNotification.tsx` — **banner toast** "{tên} đã tham gia {nhóm} qua link mời" cho quản trị,
    click banner mở đúng hội thoại. Banner hiện **cả khi đang ở trang /conversations** (khác 3 event cũ —
    vì thông tin này không tự hiển thị ở list), chỉ ẩn khi đang mở đúng hội thoại đó (system message đã
    thấy tại chỗ). Gate theo master `pushEnabled`.
- **Refactor 2026-07-13 (sau đợt 2):** phần persist Notification + FCM ở CẢ 2 nhánh (pending + vào thẳng)
  của `JoinByInvite.cs` đã **tách sang `NotificationConsumer`** qua 2 topic mới `invite.join-request.notify`
  / `invite.member-joined.notify` (model `NotifyInviteModel` — moderatorIds snapshot tại request time).
  Handler chỉ produce; nội dung notification + payload FCM giữ nguyên. Chi tiết: `TACH_THONG_BAO_LINK_MOI.md`.

### 5.3 API `GET /conversations` bị gọi 3 lần khi bấm Join group — ✅ ĐÃ FIX

- **Root cause:** vòng lặp invalidate `["conversation"]` tại `0/800/2000/4000ms` trong `Invite.tsx`
  (giữ từ fix "không hiện hội thoại" ở mục 3) — mốc 0ms không fetch (query inactive khi còn ở /invite),
  3 mốc sau đều refetch khi đã về /conversations → đúng 3 call như user quan sát.
- **Fix (`client/src/pages/Invite.tsx`):** bỏ vòng lặp; thay bằng:
  1. **Optimistic insert** card nhóm vào cache `["conversation"]` ngay khi join thành công — dựng từ
     dữ liệu đã có (preview: title/avatar + response: conversationId) kèm self-member active để lọt
     filter hiển thị của danh sách. Loại entry cũ cùng id (nhóm từng rời) trước khi chèn — không đúp.
     Conversation query `staleTime` 1h nên mount không refetch đè card optimistic.
  2. **Reconcile đúng MỘT lần** (invalidate sau 2500ms — đủ cho Kafka consumer persist) để kéo bản
     authoritative (đủ members/lastMessage). Event FCM `NewMembers` vẫn là lưới realtime thứ hai.
  - Kết quả: join → `GET /conversations` đúng **1 lần** (trước: 3-4), card nhóm hiện **ngay lập tức**
    thay vì chờ ~800ms.

---

### 5.4 Mở hội thoại (sau rejoin) KHÔNG scroll được — chỉ thấy 1 màn system message + chip "n tin nhắn mới" — ✅ ĐÃ FIX (2026-07-13)

- **Triệu chứng:** click hội thoại vừa join bằng link → chỉ hiện đúng 1 màn các dòng hệ thống
  join/leave hôm nay + chip "2 tin nhắn mới"; **không cuộn lên xem lịch sử được**.
- **Root cause (không liên quan divider/LastSeenTime — các fix trước vẫn đúng):** page size
  tin nhắn = **10** (`Shared/Constants/Paging.cs`). Nhóm bị test join/leave liên tục → 10 tin
  mới nhất **toàn system message ngắn** → nội dung page 1 **ngắn hơn viewport** → container
  không có scrollbar → **không bao giờ có scroll event**. Mà load-trang-cũ (prefetch) của
  `useChatboxScroll.ts` chỉ chạy **bên trong scroll event** (còn đòi user đã cuộn LÊN thật —
  `!atBottomRef`) ⇒ không bao giờ fetch page 2 ⇒ kẹt vĩnh viễn ở page 1. Lỗi tổng quát cho MỌI
  hội thoại có page 1 ngắn (tin ngắn/ít), rejoin chỉ là kịch bản làm lộ ra.
- **Fix — FILL-VIEWPORT (chuẩn infinite scroll):** effect mới trong `useChatboxScroll.ts`:
  sau mỗi lần page thay đổi/fetch settle, nếu `scrollHeight <= clientHeight` (chưa cuộn được)
  và còn trang cũ → chủ động `fetchPreviousPage()` tới khi nội dung tràn viewport (scrollbar
  xuất hiện) hoặc hết lịch sử; từ đó prefetch-theo-scroll sẵn có tiếp quản. Tái dùng
  `pendingPrepend` + anchor-restore nên khung nhìn không giật; guard `fillAttemptedRef` theo
  `firstMessageId` (fetch lỗi → id không đổi → không retry-loop; thành công → id đổi → vòng kế).
- **Verified:** harness state-machine 10/10 assert (fill tới tràn rồi dừng, hết trang dừng sạch,
  fetch lỗi đúng 1 lần không loop, page 1 dài không can thiệp, kịch bản screenshot); build FE pass.
  Nghiệm thu app thật 2026-07-17 ✅ (checklist mục 6, case 10-12).

### 5.5 Mở hội thoại vừa join qua link vẫn hiện chip "n tin nhắn mới" đếm dòng hệ thống — ✅ ĐÃ FIX (2026-07-17)

- **Triệu chứng:** vừa join/rejoin qua link → mở hội thoại thấy chip "n tin nhắn mới" dù các tin
  "mới" chỉ toàn dòng hệ thống join/leave — gồm cả dòng của CHÍNH lượt join (LastSeenTime được set
  tại join time, system message tạo sau đó vài ms nên luôn "mới hơn mốc đã đọc").
- **Fix (`client/src/components/conversation/Chatbox.tsx`):** loại `type === "system"` ở cả 2 chỗ:
  1. Mốc **firstUnread** (effect tính divider): dòng hệ thống không được chọn làm "tin chưa đọc đầu
     tiên" → nếu sau mốc chỉ toàn system message thì KHÔNG có divider/banner, mở thẳng ở đáy đủ lịch sử.
  2. **hiddenNewCount** (số hiện trên chip): system message xen giữa các tin mới thật không bị đếm.
- **Verified:** harness mô phỏng logic divider **21/21 assert** (7 case: rejoin chỉ-system-sau-mốc →
  không banner, mở ở đáy; system xen giữa 3 tin mới → chip đếm 3 không đếm 4; guard chat-trống
  LastSeenTime null → auto-reveal; trang bắt đầu bằng system; auto-reveal khi vùng ẩn có tin mình;
  hồi quy unread thường; tin pending bị loại). Build FE pass, tsc sạch ở file sửa. Nghiệm thu
  app thật 2026-07-17 ✅ (checklist mục 6, case 13).

### 5.6 Member khác KHÔNG thấy system message "joined" + sĩ số nhóm không đổi realtime — ✅ ĐÃ FIX (2026-07-17)

- **Triệu chứng:** X join nhóm qua link → trên UI các member hiện hữu: không có dòng hệ thống
  "X joined the group by invite link" trong khung chat, sĩ số/danh sách thành viên không cập nhật
  (chỉ đúng lại sau reload).
- **Root cause:** event FCM `NewMembers` (pipeline `member.new` → `member.stored`) chỉ gửi cho
  **chính các member mới** (`NotificationConsumer.HandleNewStoredMember` dùng `param.Members` làm
  danh sách người nhận) — member hiện hữu không nhận bất kỳ event nào. FE `onNewMembers` cũng chưa
  append system message dù payload có sẵn `message`. (Cache Redis vẫn đúng — CacheConsumer đã
  `AddSystemMessage` + `AddMembers` — nên reload là thấy; thiếu mỗi kênh realtime.)
- **Fix (theo pattern `MemberLeft` sẵn có):**
  - BE `KafkaMessage.cs`: `NewStoredGroupConversationModel` thêm `RecipientIds` — snapshot TOÀN BỘ
    member active (gồm member mới) tại thời điểm persist ở `DataStoreConsumer.HandleNewMember`
    (không re-read Mongo/cache ở NotificationConsumer → không race với CacheConsumer cùng topic).
  - BE `NotificationConsumer.HandleNewStoredMember`: fanout `NewMembers` tới `RecipientIds`;
    message cũ in-flight không có field → fallback hành vi cũ (chỉ member mới) — backward compatible.
  - FE `notificationHandlers.ts` (`onNewMembers`): append system message từ payload qua
    `upsertRealtimeMessage` (no-op nếu chưa load cache tin của hội thoại đó, dedupe theo id khi FCM
    redeliver); sĩ số cập nhật qua `membersUpdater` sẵn có (dedupe theo contact.id, phủ cả entry
    isDeleted của member rejoin).
- **Verified:** harness 14/14 assert (RecipientIds loại member đã rời/gồm reopened/distinct; Kafka
  redeliver no-op; fallback null/empty; FE append + dedupe + no-op cache lạnh; joiner optimistic
  không đúp member). Build BE 0 error; build FE + tsc sạch (file sửa). Nghiệm thu app thật
  2026-07-17 ✅ (case 14).
- **Áp dụng luôn cho luồng admin THÊM thành viên** (cùng pipeline `member.new`) — trước đây member
  hiện hữu cũng không thấy dòng "X added Y" realtime.

## 6. Checklist nghiệm thu — ✅ ĐÃ NGHIỆM THU TOÀN BỘ 2026-07-17

| # | Luồng | Kết quả mong đợi |
| --- | --- | --- |
| 1 | User leave nhóm → mở link → **Join group** → click vào hội thoại ngay | **Toàn bộ lịch sử tin nhắn hiện ra** (không còn khung trống), có vạch/dòng hệ thống "joined via invite link" |
| 2 | Rejoin xong **reload** trang → click hội thoại | Tin nhắn hiển thị đầy đủ |
| 3 | B vào nhóm qua link, **cửa sổ admin đang mở app** (foreground) | Admin thấy **banner toast** "B đã tham gia {nhóm} qua link mời" (kể cả đang ở trang conversations); click banner mở đúng hội thoại; badge chuông tăng |
| 4 | B vào nhóm qua link, cửa sổ admin đang ở tab/app khác | Khi admin quay lại app: badge chuông cập nhật (refetch on focus); trang /notifications có bản ghi "B joined {group} via invite link" (icon user-plus) |
| 5 | Bấm **Join group** với DevTools Network mở | `GET /conversations` chỉ gọi **1 lần** (reconcile ~2.5s sau join); card nhóm hiện **ngay** trong danh sách, không đúp |
| 6 | (Hồi quy) Mở hội thoại thường có tin chưa đọc (mốc đã-đọc nằm giữa lịch sử) | Vẫn ẩn phần tin mới + banner "n tin nhắn mới", bấm banner hiện vạch + tin — như thiết kế cũ |
| 7 | (Hồi quy) Nhóm bật duyệt: xin vào → admin duyệt | Người xin thấy hội thoại + đủ tin nhắn; quản trị KHÔNG nhận thêm notification/banner "joined via invite link" (chỉ luồng vào thẳng mới có) |
| 8 | (Hồi quy) Rời → vào lại → rời lại lần nữa | Không lỗi 500, không trùng thành viên (fix 2026-07-12 không bị hồi quy) |
| 9 | (Hồi quy) Tắt Push notification trong Settings rồi để người khác join qua link | KHÔNG hiện banner (bản ghi ở trang /notifications vẫn có) |
| 10 | Mở hội thoại rejoin có 10 tin gần nhất toàn system message (kịch bản screenshot 22:28 13/07) | Khung chat **tự nạp thêm lịch sử** cho tới khi cuộn được; cuộn lên tiếp tục load trang cũ bình thường; không giật vị trí |
| 11 | (Hồi quy) Mở hội thoại dài bình thường | Mở phát ăn ngay ở đáy, KHÔNG tự fetch trang cũ thừa (Network chỉ 1 call messages), cuộn lên mới load thêm |
| 12 | (Hồi quy) Hội thoại mới tạo chỉ có vài tin (hết lịch sử) | Không loop gọi API messages liên tục (Network yên sau 1-2 call), không lỗi console |
| 13 | Join/rejoin qua link → mở hội thoại ngay (chỉ có dòng hệ thống mới sau mốc join) | **KHÔNG** hiện chip "n tin nhắn mới"; mở thẳng ở đáy đủ lịch sử. Nếu sau đó người khác nhắn m tin text (xen lẫn dòng join/leave) → chip đếm đúng **m**, không tính dòng hệ thống |
| 14 | X join qua link trong lúc member khác đang MỞ hội thoại nhóm (foreground) | Khung chat member đó hiện ngay dòng hệ thống "X joined the group by invite link" (không reload); panel Members/sĩ số cập nhật ngay; member đã RỜI nhóm không nhận gì. Hồi quy: admin **thêm** thành viên cũng hiện dòng "added" realtime cho mọi member |
