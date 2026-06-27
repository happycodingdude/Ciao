# Handoff: Notifications (Teams-style) + Settings enforce + Profile propagation

> **Cập nhật:** 2026-06-26 · **Trạng thái:** code xong, build/typecheck sạch, **CHƯA verify end-to-end với BE thật**.
> Liên quan: [`AP_DUNG_CAI_DAT_TRIEN_KHAI.md`](./AP_DUNG_CAI_DAT_TRIEN_KHAI.md) · [`AP_DUNG_CAI_DAT_NGHIEM_THU.md`](./AP_DUNG_CAI_DAT_NGHIEM_THU.md)
>
> **Mới nhất 2026-06-26:** xem [§7 — Fix layout bể + badge bell sidebar](#7-fix-layout-bể--badge-unread-trên-icon-bell-2026-06-26).
> **2026-06-27 (BE+FE):** xem [§8 — Highlight tin sâu lịch sử (messages/around)](#8-highlight-tin-nằm-sâu-lịch-sử--fetch-cửa-sổ-quanh-messageid-2026-06-27) và [§9 — fix paging/font/realtime/resilience](#9-menu-notifications-2026-06-2627--fix-paging-font-realtime-resilience). Index doc: [`NOTIFICATION_INDEX.md`](./NOTIFICATION_INDEX.md).

---

## ⚠️ LÀM TRƯỚC KHI TEST (bắt buộc)

1. **Restart backend** — BE đang chạy giữ DLL cũ, chưa nạp logic mới (banner text, propagate profile, các field notification mới).
2. **Restart Vite dev server** (không chỉ HMR) — có thay đổi `.env`; file-watch WSL↔Windows (`/mnt/c`) không tin cậy. Sau đó **hard refresh** `Ctrl+Shift+R`.

```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build Chat.API/Chat.API.csproj
"/mnt/c/Program Files/dotnet/dotnet.exe" run --project Chat.API
cd client && npm run dev
# typecheck FE: node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
```

> Build BE khi BE đang chạy sẽ fail ở bước copy DLL (file lock) — không phải lỗi biên dịch. Stop process trước, hoặc build từng project vào output riêng: `-p:BaseOutputPath=/tmp/ciaobuild/x/`.

---

## 1. Banner FCM title/body có nghĩa (thay "Ciao notify")

| File | Nội dung |
|---|---|
| `Application/Notifications/NotificationBanner.cs` (**mới**) | Derive `(title, body)` từ `(event, data)` |
| `Infrastructure/Notifications/FirebaseFunction.cs` | `SendMulticast` gọi `NotificationBanner.Build` khi `banner=true` |

- 1-1: title=tên người gửi, body=preview · group: title=tên nhóm, body="{sender}: {preview}" · media: "📷 Photo"/"📎 File".
- **Follow-up:** reaction/friend-request banner chưa kèm tên actor (cần thread tên vào event data tại `HandleNewReaction`, `AddFriend`).

## 2. Sửa lỗi trang Notifications (FE)

| Lỗi | Fix | File |
|---|---|---|
| Chuông sidebar chỉ sáng ở tab All | `activeOptions={{ includeSearch: false }}` (cả Connections) | `components/layouts/SideBarMenu.tsx` |
| Không có data | Thêm env thiếu `VITE_ENDPOINT_NOTIFICATION_GET_PAGED = '/notifications?page={page}&limit={limit}'` | `client/.env` |
| Call `/notifications` 2 lần | Bỏ `useEffect` invalidate-on-mount; `staleTime: Infinity → 0` | `pages/Notification.tsx`, `hooks/useNotification.ts` |
| Sort + icon mention-everyone | Sort `createdTime` desc; icon `fa-users` | `pages/Notification.tsx`, `utils/notificationDisplay.ts` |

## 3. Đổi profile lan sang user khác (BE+FE)

| File | Nội dung |
|---|---|
| `Presentation/Contact/UpdateContact.cs` | `PropagateProfile()`: fan-out name/avatar/bio → friend cache mỗi bạn + member cache mọi conversation; push `ContactUpdated` (data-only) |
| `Application/WebSocketEvents/ChatEventNames.cs` · `ChatEventModels.cs` | Event `ContactUpdated` + DTO `EventContactUpdated` |
| `client/src/utils/notificationHandlers.ts` · `types/notification.types.ts` | Handler `onContactUpdated` patch `["friend"]` + members trong `["conversation"]` |

- Direct-chat title tự đúng (FE lấy `otherMember.contact.name`).
- *Cache cũ chỉ sửa khi user update lần tới / các bên re-login.*

## 4. Redesign Notifications theo Microsoft Teams (BE+FE)

### BE — enrich notification (no migration, default rỗng)
| File | Field thêm / populate |
|---|---|
| `Domain/Entities/Notification.cs` | `ActorName`, `ActorAvatar`, `Action`, `Preview`, `SourceMessageId` |
| `Infrastructure/BackgroundJobs/NotificationConsumer.cs` | reaction + mention: populate đủ field (`SourceMessageId` = id tin gốc) |
| `Presentation/Friend/AddFriend.cs` | friend_request: populate + sửa câu → "sent you a friend request" |

`GetNotifications` trả thẳng entity → field mới tự camelCase ra FE.

### FE
| File | Nội dung |
|---|---|
| `types/base.types.ts` | `NotificationModel` thêm `actorName/actorAvatar/action/preview/sourceMessageId` (optional) |
| `utils/notificationDisplay.ts` | `notificationParts()` (parse `content` cho data cũ); `notificationVisual()` nhận cả notification |
| `components/notification/NotificationItem.tsx` | Item Teams: avatar (chữ-cái-đầu nếu trống) + badge overlay + tên đậm / action / preview + time + highlight item chọn |
| `components/notification/NotificationTabs.tsx` | Pill tối giản (bỏ icon, active nền nhẹ) |
| `components/notification/NotificationReview.tsx` (**mới**) | Dispatcher pane phải: empty / friend_request (card + "View request") / conversation |
| `components/notification/ConversationReview.tsx` (**mới**) | Read-only: header + tin nhắn (render mention qua `renderMessageWithMentions`) + "Open in chat"; highlight đúng 1 tin |
| `pages/Notification.tsx` | Layout 2 cột; header "Activity"; selection state; màn <1024px ẩn pane → click điều hướng |

### Chi tiết quan trọng
- **Highlight 1 noti = 1 tin:** ưu tiên `sourceMessageId`; data cũ → tin gần `notification.createdTime` nhất (phân biệt mentioned-you `@[tên mình]` vs everyone `@[All]`). Highlight gói gọn trong bong bóng (nền vàng + viền amber), **không** tràn full-width.
- **Fix layout bể** (header "Activity" bị cắt do page-scroll): đổi `h-full` → **`h-screen`** tuyệt đối cho hàng + 2 cột. Cột trái `flex h-screen w-full flex-col` (header/tabs `shrink-0`, list cuộn nội bộ); cột phải `h-screen grow`.
- `#portal` giữ lại (video call dùng; không có global trong `index.html`), đặt block-sibling ngoài flex container.

---

## 7. Fix layout bể + badge unread trên icon bell (2026-06-26)

> Thay đổi FE thuần. Tất cả ở `client/`. Typecheck file liên quan sạch (lỗi `tsc` còn lại là pre-existing ở `AddMembersModal`/`CreateGroupChatModal`, không liên quan).

### 7.1 Layout Notifications bị "bể" — header bị cắt đỉnh (ĐÃ FIX)
**Triệu chứng:** chọn 1 notification → cả 2 cột (Activity + pane phải) bị cắt mất phần trên.

**Root cause (KHÔNG phải `h-full` vs `h-screen`):**
- Global `index.css`: `#portal { height: 100% }`. Trong `pages/Notification.tsx`, `#portal` là **block-sibling trong normal flow** của `<section h-screen overflow-hidden>` → section có content ~**200vh** (100vh row + 100vh portal).
- `overflow-hidden` **KHÔNG chặn `scrollIntoView()`**. `ConversationReview` gọi `firstHlRef/bottomRef.scrollIntoView()` để cuộn tới tin highlight → cuộn **mọi scroll-ancestor kể cả section** → đẩy header lên khỏi viewport.
- Trang **Connections** cùng pattern nhưng KHÔNG có `#portal` nên không dính → xác nhận portal là thủ phạm.

**Fix (`pages/Notification.tsx`):**
- `#portal` → `className="absolute inset-0 z-50 empty:hidden"`: ra khỏi flow (không cộng 100vh), `empty:hidden` để khi rỗng không che/chặn click; chỉ hiện khi video-call inject child (overlay, không phá layout).
- Inner wrapper + 2 cột: `h-screen` → `h-full` (clamp theo section, không tự giả định viewport).

### 7.2 Badge số noti chưa đọc trên icon bell sidebar (MỚI)
Hiện số notification chưa đọc trên chuông để thấy khi đang ở menu khác.

| File | Nội dung |
|---|---|
| `hooks/useUnreadNotificationCount.ts` (**mới**) | Đếm `!read` từ query **`["notifications","infinite"]`** (xem 7.3) |
| `components/layouts/SideBarMenu.tsx` | Thêm `<UnseenBadge count={unreadNotiCount} />` vào `<Link to="/notifications">` (dùng lại badge của icon Chats; `.sidebar-item` đã `position:relative`) |
| `utils/notificationHandlers.ts` | Helper `invalidateNotifications()` invalidate **cả 2 key**; gọi ở `onFriendRequestReceived`, `onNewReaction`, và `onNewMessage` **chỉ khi self-mention** (`@[All]` / `@[tên mình]` — tránh refetch mỗi tin nhắn) |

### 7.3 Badge ≠ tab "Unread" (lệch số) — ĐÃ FIX
**Triệu chứng:** chuông = 3 nhưng tab Unread = 4.

**Root cause:** badge và tab đọc **2 query khác nhau** (`["notification"]` vs `["notifications","infinite"]`), fetch khác thời điểm; thêm việc BE tạo notification **bất đồng bộ** (Kafka `NotificationConsumer`) → invalidate realtime refetch *trước khi* noti persist → badge thiếu.

**Fix:** badge đọc **CHUNG** query `["notifications","infinite"]` với trang (tab Unread), đếm `(data?.pages ?? []).flat().filter(!read)` — trùng khít `unreadCount` ở `Notification.tsx`. Cùng 1 cache ⇒ **không bao giờ lệch**. `read`/`readAll` đã cross-invalidate cả 2 key nên badge tự giảm khi đọc.

> ⚠️ **Còn lại để verify:** race "BE tạo noti async" làm badge có thể **lag** (badge==tab nhưng cả hai chưa kịp thấy noti vừa tạo) — tự đồng bộ ở lần vào trang / event kế tiếp. Nếu cần realtime tức thì: BE phát 1 event riêng "NotificationCreated" sau khi consumer persist, thay vì FE đoán từ NewMessage/NewReaction.

### Memory liên quan
- `portal-height-flex-gotcha` (đã update): `#portal` LUÔN dùng `absolute + empty:hidden`; cảnh báo `scrollIntoView` cuộn cả section overflow-hidden.

---

## 8. Highlight tin nằm sâu lịch sử — fetch cửa sổ quanh messageId (2026-06-27)

> Thay đổi BE+FE. Trước đây pane review chỉ fetch page 1 (10 tin mới nhất) → tin được mention/react nằm sâu lịch sử không có trong page 1 → **không highlight được**.

**Giải pháp:** endpoint mới lấy cửa sổ tin **quanh `sourceMessageId`** (mặc định 5 trước + 5 sau).

### BE
| File | Nội dung |
|---|---|
| `Presentation/Conversation/GetMessagesAround.cs` (**mới**) | `GET /conversations/{id}/messages/around?messageId={id}&radius=5`. Lấy full list từ Redis cache (`MessageCache.GetMessages`), `OrderBy(CreatedTime)` → `FindIndex(messageId)` → cắt `[idx-radius .. idx+radius]`, map `MessageReactionSummary` + set `CurrentReaction`, trả cũ→mới. Validator `ContactRelatedToConversation` (mirror `GetMessages`). |

- **Không tìm thấy** messageId (cache evict / tin đã xoá) → fallback trả cửa sổ tin **mới nhất** (`2*radius`) để pane không rỗng.
- Reuse DTO `MessagesWithHasMore`; `HasMore = start > 0` (còn tin cũ hơn trước cửa sổ).

### FE
| File | Nội dung |
|---|---|
| `client/.env` | `VITE_ENDPOINT_MESSAGE_GET_AROUND = '/conversations/{id}/messages/around?messageId={messageId}&radius={radius}'` |
| `services/message.service.ts` | `getMessagesAround(convId, messageId, radius=5)` |
| `hooks/useMessage.ts` | `messagesAroundQueryOption` — **key riêng** `["message","around",convId,messageId]` (KHÔNG đụng cache chat chính `["message", convId]`) |
| `components/notification/ConversationReview.tsx` | Có `sourceMessageId` → `useQuery(messagesAroundQueryOption, enabled)`; không có (data cũ) → page 1 + heuristic cũ. Loading gate theo query đang active. |

### Quyết định
- **Key cache riêng** cho around: tránh ghi đè `["message", conversationId]` mà Chatbox chính dùng (full-semantics list, không thể bị thay bằng 11 tin).
- Chỉ kích hoạt around khi có `sourceMessageId` (data tạo **sau restart BE**); data cũ giữ heuristic thời gian → không regression.
- ⚠️ Cần **restart Vite** (đổi `.env`) + **restart BE** (endpoint mới).

---

## 9. Menu Notifications (2026-06-26→27) — fix paging, font, realtime, resilience

> Gộp các thay đổi còn lại. Build BE + typecheck FE sạch. **Chưa verify end-to-end với BE thật.**

### 9.1 Bug fixes

| # | Bug | Root cause | Fix | File |
|---|---|---|---|---|
| 1 | Trang `/notifications` **trắng**, không load data | `notification.service.ts` đọc `VITE_ENDPOINT_NOTIFICATION_GET_PAGED` nhưng key **thiếu** trong `.env` → `undefined.replace()` ném `TypeError` trong queryFn | Thêm lại env key | `client/.env` |
| 2 | API `/notifications` **trả vượt limit** | Handler gọi `GetAllAsync` → trả TOÀN BỘ noti của user, bỏ qua `page/limit`, không sort | Thêm `GetPagedAsync` generic (sort `CreatedTime` desc + skip/limit), handler dùng `PagingParam`. Bonus: page 1 = mới nhất | `IMongoRepository.cs`, `MongoBaseRepository.cs`, `GetNotifications.cs` |
| 3 | **Font tổng thể to** so với conversations | Component viết theo thang Tailwind chuẩn, nhưng project **remap** lớn hơn (`text-sm`=18px, `text-xs`=16px, `text-xl`=32px) | Hạ về thang nhỏ của project: `text-2xs`(14)/`text-3xs`(12)/`text-4xs`(10); header `text-base`(20); avatar `w-11→w-10` | `NotificationItem/List/Tabs.tsx`, `Notification.tsx`, `NotificationReview/ConversationReview.tsx` |
| 4 | Dot unread **làm lệch giờ** | Dot là flex-child có điều kiện → item read/unread khác width → cột content co lại đẩy `timeLabel` lệch giữa các dòng | **Slot cố định** `w-2` (dot khi unread, trống khi read) → width đồng nhất | `NotificationItem.tsx` |
| 5 | Pane review **nháy** header | `ConversationReview` render khi `/conversations` chưa về → fallback "Conversation"/avatar pop sang data thật | Gate loading: chờ `isConversationLoading` + `isMessageLoading` (gate theo cờ `isLoading`, KHÔNG theo `conversation===undefined` để tránh kẹt spinner khi conv ngoài cache) | `ConversationReview.tsx` |
| 6 | Ở **chính trang** notifications **không nhận** tín hiệu noti mới (menu khác thì có) | BE tạo noti **async** (Kafka); FCM push bắn trước khi persist → invalidate tức thì refetch trúng list cũ. Menu khác "có" là nhờ `refetchOnWindowFocus`; đứng yên trên trang (tab focus) thì không có refocus | `invalidateNotifications` invalidate tức thì **+ lặp lại trễ** `[0,1200,3000]ms` để bắt bản ghi persist muộn | `notificationHandlers.ts` |
| 7 | List tin pane review **dồn lên đầu** khi ít tin | container `flex-col` mặc định align top | Wrapper trong `mt-auto` → ít tin dồn xuống đáy, nhiều tin collapse + cuộn bình thường (an toàn hơn `justify-end`) | `ConversationReview.tsx` |

### 9.2 Tính năng FE thêm (resilience cho list)

| Tính năng | Mô tả | File |
|---|---|---|
| **Error state + Retry** | API lỗi lần đầu (chưa có data) → UI lỗi + nút Retry (`refetch`), thay vì hiện nhầm "No notifications" | `NotificationList.tsx` (+ `isError`/`refetch` từ `Notification.tsx`) |
| **Auto infinite scroll** | Bỏ nút "Load more" thủ công → IntersectionObserver sentinel (preload 120px), `onLoadMore` giữ qua ref | `NotificationList.tsx` |
| **Tab lọc rỗng còn trang** | Empty chỉ hiện khi `total===0 && !hasNextPage`; nếu còn trang (tab Unread/Requests/System lọc rỗng) → render sentinel auto-load tiếp, không hiện "No notifications" sai | `NotificationList.tsx` |
| **Chặn retry storm** | `fetchNextPage` lỗi → observer ngừng auto (`isFetchNextPageError`), hiện nút "Retry" thủ công → tránh vòng lặp đập server | `NotificationList.tsx` (+ `isFetchNextPageError` từ `Notification.tsx`) |

### 9.3 Còn nợ (chưa fix)

- **Badge & tab Unread chỉ đếm trang đã load** — >10 noti chưa đọc mà mới load page 1 → đếm thiếu. Cần BE trả `unreadTotal` (hoặc auto-load hết ở tab Unread). Auto-scroll giảm nhẹ nhưng chưa triệt để.
- Index Mongo `Notification { ContactId:1, CreatedTime:-1 }` — script ở [`NOTIFICATION_INDEX.md`](./NOTIFICATION_INDEX.md), **chưa chạy trên DB**.

### 9.4 Môi trường (lưu ý)
- Máy hiện tại là **macOS** → `dotnet` (10.0.203) ở `/usr/local/bin/dotnet`, **KHÔNG** dùng path WSL `/mnt/c/...` như §"LÀM TRƯỚC KHI TEST" cũ.
- Build tránh lock khi BE chạy: `-p:BaseOutputPath=/private/tmp/...`.

---

## Quyết định đã chốt (đừng mở lại)

- Pane review **READ-ONLY** + nút "Open in chat". Hướng **reply inline** (full chat nhúng như Teams) **DEFER** — cần decouple `ChatboxContainer` khỏi route `/conversations/$conversationId` (~11 component dùng `Route.useParams()`), rủi ro cho chat chính.
- Mention dùng **Option B** (userId); FE render `@[name]` qua `renderMessageWithMentions`.
- Không migration (field mới default rỗng, backward-compatible; data cũ FE fallback parse `content`).

---

## Việc còn lại / Follow-up

1. **Verify end-to-end** sau khi restart BE+FE: đổi profile lan sang user khác; mention trùng tên; banner suppression per-type; highlight chính xác.
2. Banner reaction/friend-request kèm tên actor (thread vào event data).
3. Highlight chính xác cho **reaction** + mọi loại chỉ chạy với notification tạo **sau restart BE** (`SourceMessageId`); data cũ dùng heuristic thời gian. ✅ Tin nằm sâu lịch sử nay highlight được nhờ endpoint `messages/around` (§8).
4. (Tuỳ chọn) Reply inline trong pane review.
5. (Cũ) Phase 6 `ShowLastSeen` defer; index Mongo `Friend.FromContact/ToContact.ContactId`; backfill `AcceptTime`.
   - **Notification paging index** `{ ContactId: 1, CreatedTime: -1 }` — script + verify ở [`NOTIFICATION_INDEX.md`](./NOTIFICATION_INDEX.md) (CHƯA chạy trên DB).
6. **Badge bell realtime (§7.3):** đang dựa vào FE đoán noti từ event NewMessage/NewReaction/NewFriendRequest + invalidate (có race với consumer async). Cân nhắc BE phát event riêng "NotificationCreated" sau khi `NotificationConsumer` persist để badge chính xác tức thì. Cũng cần verify badge khi >10 noti chưa đọc (hiện đếm theo các page đã load).

## Lệnh nhanh

```bash
# BE build (stop process đang chạy trước, hoặc dùng BaseOutputPath riêng)
"/mnt/c/Program Files/dotnet/dotnet.exe" build Presentation/Presentation.csproj -clp:ErrorsOnly -p:BaseOutputPath=/tmp/ciaobuild/pres/
# FE typecheck
cd client && node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
```

---

## §10 — 2026-06-28: tín hiệu tin nhắn + style preview + badge

### 10.1 Fix tín hiệu tin nhắn (badge lệch / không nhận tin / badge phantom)
Chi tiết: [`FIX_MESSAGE_SIGNAL.md`](./FIX_MESSAGE_SIGNAL.md).
- `buildConvFromMessage` thiếu `members` → list lọc ẩn hội thoại từ người/nhóm **mới** (nhắn
  lần đầu không thấy); thiếu `unSeen` → badge không đếm. ⇒ gắn đủ `members` + `unSeen`.
- `updateConversationCache` dùng `...(patch.unSeen && …)` → không set được `false` (badge kẹt
  cao). ⇒ đổi `!== undefined`.
- Badge `useUnseenConversationCount` đếm không áp filter membership như list ⇒ thêm filter đồng bộ.
- **Badge=1 nhưng list không có cái nào chưa đọc:** conversation đang mở nhận tin lúc đang xem
  nhưng `isConversationActive` race → `unSeen=true`, list tô màu active (xám) không đỏ, badge vẫn
  đếm. ⇒ helper `markConversationSeen` clear `unSeen` đúng lúc `markRead` (Chatbox).
- (Đã thử catch-up refetch khi focus nhưng **revert** vì gây loading mỗi lần focus.)
- ⚠️ Realtime vẫn **FCM-only** (SignalR chỉ cho WebRTC) → Brave/browser chặn Google push dễ mất
  tin. Hướng bền vững: chuyển message events qua SignalR hub `ciaohub` (đã có) — **chờ duyệt**.

### 10.2 Chat preview /notifications đồng nhất style khung chat
Chi tiết: [`FIX_NOTIF_CHAT_PREVIEW_STYLE.md`](./FIX_NOTIF_CHAT_PREVIEW_STYLE.md).
`ConversationReview`: bong bóng `bg-white + shadow + rounded-xl` (cả 2 phía), nền `--bg-color`,
avatar `h-8` gom block, tên/giờ (`HH:mm`) theo `MessageContent`. Cỡ chữ bong bóng **`text-xs`**.

### 10.3 Badge số trên menu sidebar to hơn
`UnseenBadge` (dùng chung Conversations + Notifications + ChatIcon): `text-[0.6rem]→0.72rem`,
`min-w 1.05rem→1.3rem`.
