# Handoff: Notifications (Teams-style) + Settings enforce + Profile propagation

> **Cập nhật:** 2026-06-26 · **Trạng thái:** code xong, build/typecheck sạch, **CHƯA verify end-to-end với BE thật**.
> Liên quan: [`AP_DUNG_CAI_DAT_TRIEN_KHAI.md`](./AP_DUNG_CAI_DAT_TRIEN_KHAI.md) · [`AP_DUNG_CAI_DAT_NGHIEM_THU.md`](./AP_DUNG_CAI_DAT_NGHIEM_THU.md)
>
> **Mới nhất 2026-06-26 (session FE):** xem [§7 — Fix layout bể + badge bell sidebar](#7-fix-layout-bể--badge-unread-trên-icon-bell-2026-06-26).

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

> Session FE thuần. Tất cả thay đổi ở `client/`. Typecheck file liên quan sạch (lỗi `tsc` còn lại là pre-existing ở `AddMembersModal`/`CreateGroupChatModal`, không liên quan).

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

## Quyết định đã chốt (đừng mở lại)

- Pane review **READ-ONLY** + nút "Open in chat". Hướng **reply inline** (full chat nhúng như Teams) **DEFER** — cần decouple `ChatboxContainer` khỏi route `/conversations/$conversationId` (~11 component dùng `Route.useParams()`), rủi ro cho chat chính.
- Mention dùng **Option B** (userId); FE render `@[name]` qua `renderMessageWithMentions`.
- Không migration (field mới default rỗng, backward-compatible; data cũ FE fallback parse `content`).

---

## Việc còn lại / Follow-up

1. **Verify end-to-end** sau khi restart BE+FE: đổi profile lan sang user khác; mention trùng tên; banner suppression per-type; highlight chính xác.
2. Banner reaction/friend-request kèm tên actor (thread vào event data).
3. Highlight chính xác cho **reaction** + mọi loại chỉ chạy với notification tạo **sau restart BE** (`SourceMessageId`); data cũ dùng heuristic thời gian.
4. (Tuỳ chọn) Reply inline trong pane review.
5. (Cũ) Phase 6 `ShowLastSeen` defer; index Mongo `Friend.FromContact/ToContact.ContactId`; backfill `AcceptTime`.
6. **Badge bell realtime (§7.3):** đang dựa vào FE đoán noti từ event NewMessage/NewReaction/NewFriendRequest + invalidate (có race với consumer async). Cân nhắc BE phát event riêng "NotificationCreated" sau khi `NotificationConsumer` persist để badge chính xác tức thì. Cũng cần verify badge khi >10 noti chưa đọc (hiện đếm theo các page đã load).

## Lệnh nhanh

```bash
# BE build (stop process đang chạy trước, hoặc dùng BaseOutputPath riêng)
"/mnt/c/Program Files/dotnet/dotnet.exe" build Presentation/Presentation.csproj -clp:ErrorsOnly -p:BaseOutputPath=/tmp/ciaobuild/pres/
# FE typecheck
cd client && node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
```
