# Handoff — Refactor trang Conversations

> Đọc file này để quay lại làm tiếp. Tài liệu kế hoạch + inventory chi tiết: `REFACTOR_CONVERSATIONS_PLAN.md`.
> Ngày: 2026-06-28. Trạng thái: **CODE XONG — chờ nghiệm thu runtime thủ công.**

---

## TL;DR — đang ở đâu

| | |
|---|---|
| Phương án | C (full): `useMessage` → **useInfiniteQuery** + helper layer + realtime append |
| Refetch | **merge** (infinite query tự refetch tất cả pages đã load khi stale) |
| Code | ✅ Xong 5/5 batch. `vite build` ✅, `tsc` chỉ còn lỗi **pre-existing** `useRef()` (AddMembersModal, CreateGroupChatModal) |
| Chạy | dev server vite :5000, backend Chat.API :4000 (HMR đang hoạt động) |
| Còn lại | ⏳ Nghiệm thu thủ công runtime + 2 enhancement tuỳ chọn (xem cuối) |

---

## Thay đổi cốt lõi cần nhớ

**Message cache `["message", id]` GIỜ LÀ `InfiniteData<MessageCache>`, KHÔNG còn phẳng.**
→ Tuyệt đối KHÔNG `setQueryData(["message", id], (old: MessageCache)...)` trực tiếp. Phải dùng helper ở
`client/src/utils/messageCache.ts`:

| Helper | Dùng khi |
|--------|----------|
| `appendMessage(qc, convId, msg)` | tin mới (gửi/nhận realtime) → page mới nhất, có dedupe |
| `updateMessageById(qc, convId, id, updater)` | edit/confirm-send/react/pin/đổi tmpId→realId |
| `mutateMessagePages(qc, convId, fn)` | bọc helper MessageCache→MessageCache cũ (edit/recall) |
| `removeMessageById` / `readMessageData` / `readFlatMessages` / `writeMessageData` / `makeInfinite` / `flattenInfinite` | xoá / đọc / ghi / khởi tạo / làm phẳng |

- `useMessage(conversationId)` — 1 tham số (bỏ `page`). pages thứ tự chronological `[cũ…mới]`, load trang cũ qua `fetchPreviousPage`. `getNextPageParam=undefined` (tin mới qua realtime append, không fetch).
- Pane review notification dùng query PHẲNG riêng `messageFirstPageQueryOption` (key `["message","review",id]`) — KHÔNG đụng cache infinite chính.
- Realtime (`notificationHandlers.ts`): `onNewMessage` **append thẳng** (bỏ invalidate-inactive); react/pin → `updateMessageById`; edit/recall → `mutateMessagePages`.

---

## Files đã đụng (21 file)

**Thêm mới:** `utils/messageCache.ts`, `hooks/useIsPhoneScreen.ts`
**Xoá:** `components/conversation/{ListChat,ListchatContent}.tsx`, `ToggleNotification.jsx`
**Sửa chính:** `hooks/{useMessage,useChatboxScroll,useSendMessage,useMessageActions,usePinMessage,useDirectMessage}.ts`, `components/conversation/{Chatbox,ChatboxHeader,ChatInput,AddMembersModal}.tsx`, `components/layouts/{ChatboxContainer,SideBarMenu_Mobile}.tsx`, `components/friend/FriendCtaButton.tsx`, `components/message/MessageContent.tsx`, `components/notification/ConversationReview.tsx`, `utils/notificationHandlers.ts`, `utils/notificationCacheHelpers.ts`, `services/message.service.ts`, `lib/fetch.ts`, `types/{message,base}.types.ts`, 2 route files.

---

## Tính năng "Gửi lỗi" (#10) — LƯU Ý QUAN TRỌNG khi test

Đã fix root cause: `lib/fetch.ts` trước đây không có abort timeout (req.timeout chỉ là *delay*). Đã thêm:
- field `requestTimeout` (axios abort thật) trong `base.types.ts` + `fetch.ts` + `sendMessage`.
- `useSendMessage`: guard `navigator.onLine` (fail tức thì khi offline) + abort timeout **15s** (ca server treo).
- `MessageContent`: hiển thị "⚠ Gửi lỗi" + type `PendingMessageModel.failed`.

**⚠️ KHÔNG test offline bằng DevTools throttle với backend localhost:4000** — Chrome **không áp throttle/Offline cho loopback** → request luôn thành công → không có gì để báo lỗi (KHÔNG phải bug).

**Cách test gửi lỗi ĐÚNG:**
1. **Tắt backend** (tin cậy nhất): `kill <PID Chat.API cổng 4000>` → gửi → connection refused → "Gửi lỗi" ~1s. Bật lại sau.
2. **Đúng preset "Offline"** (Network dropdown, không phải custom profile) → lật `navigator.onLine=false` → guard chạy → "Gửi lỗi" tức thì. Verify: Console gõ `navigator.onLine` phải ra `false`.
3. Chuột phải request `/messages/send` → Block request URL.

---

## ⏳ CÒN LẠI — việc cần làm khi quay lại

### A. Nghiệm thu runtime thủ công (ưu tiên cao nhất — chưa làm)
3 ca rủi ro cao của đợt refactor, BẮT BUỘC pass:
- [ ] **Cuộn lên load nhiều trang cũ → giữ nguyên vị trí đọc** (scroll-anchor `useChatboxScroll`)
- [ ] **Dedupe realtime**: FCM gửi trùng / multi-tab cùng user → không nhân đôi tin
- [ ] **refetch-merge**: cuộn nhiều trang, offline→online (reconnect) → KHÔNG mất trang đã cuộn

Còn lại (2 tab A/B):
- [ ] Đổi hội thoại liên tục không lẫn cache
- [ ] Gửi text/media (mạng chậm) optimistic → confirmed
- [ ] Đang đọc lịch sử + có tin mới → KHÔNG bị nhảy xuống đáy (#3)
- [ ] react/pin/edit/recall realtime qua 2 tab (cross-page)
- [ ] Nhận tin khi active/inactive (badge unSeen)
- [ ] Tạo direct chat mới từ Friend/CTA (FriendCtaButton shape fix)
- [ ] Gửi lỗi (theo cách test ở trên)
- [ ] Resize/xoay màn hình → layout phone reactive (#7)

→ Checklist đầy đủ: mục "Phase ... acceptance" trong lịch sử chat / `REFACTOR_CONVERSATIONS_PLAN.md`.

### B. Enhancement tuỳ chọn (chưa làm — chờ quyết định)
- [ ] **Retry-on-click**: bấm vào tin "Gửi lỗi" để gửi lại (cần truyền callback re-send xuống `MessageContent`).
- [ ] **Abort timeout cho upload media**: `uploadFile` hiện chưa có timeout riêng (chỉ guard offline). Online-nhưng-treo khi upload sẽ không tự fail.

### C. Quyết định đã chốt — GIỮ NGUYÊN (đừng đụng lại)
- `#16 prevConvId` module-scope `let` trong `ChatboxContainer`: giữ nguyên (hành vi survive-remount có chủ đích).
- `isPhoneScreen()` vẫn dùng ở 16 file NGOÀI trang conversations (auth/sidebar/profile…) — ngoài scope.

---

## 🔎 Audit đợt 2 (2026-06-28) — rà soát theo plan

6 lỗi phát hiện khi đối chiếu code với plan. Nhóm **non-network đã FIX**, nhóm **network/realtime DEFER** (cần simulate offline/reconnect/multi-tab mới test được).

| # | Mức | Trạng thái | Lỗi | Vị trí |
|---|-----|-----------|-----|--------|
| A | 🟠 | ⏳ DEFER (network) | refetch-merge xoá tin optimistic (pending/failed) | `useMessage.ts:28-29` + RQ |
| B | 🟡 | ✅ FIXED | `onNewConversation` ghi `filterConversations` từ `old.conversations` (sai nguồn) | `notificationHandlers.ts:299` |
| C | 🟡 | ⏳ DEFER (realtime) | dedupe hụt: optimistic `randomId` vs FCM `realId` đến trước confirm → nhân đôi | `messageCache.ts:56` |
| D | 🟡 | ✅ FIXED | `useSendMessage` gửi tới `conversation?.id ?? ""` thay vì `conversationId` | `useSendMessage.ts` |
| E | 🟢 | ✅ FIXED | `pendingPrepend` không reset khi đổi hội thoại → nhảy scroll | `useChatboxScroll.ts` |
| F | 🟢 | ✅ FIXED | `markRead` effect deps `messages` → gọi lặp mỗi lần cache đổi | `Chatbox.tsx` |

### A — refetch-merge xoá tin optimistic (CHƯA FIX — chờ quyết định)
`refetchOnMount:true` (sau staleTime 120s) + `refetchOnReconnect:true` → infinite query refetch **toàn bộ pages**, page mới nhất bị thay nguyên bằng data server → mọi tin **chỉ có trong cache** (pending/failed) biến mất:
- Tin "Gửi lỗi" tự mất sau offline→online hoặc quay lại hội thoại >120s.
- **Race:** đang gửi (pending ở page 1) mà refetch chen vào → page 1 bị thay → tin pending mất → `sendMessage` resolve → `updateMessageById(randomId)` không thấy id → **no-op → tin biến mất khỏi màn** (vẫn vào DB, hiện lại ở full-reload sau).

→ Tiêu chí "offline→online KHÔNG mất trang" vẫn đúng (pages server giữ nguyên), nhưng **tin optimistic mất**.
**Hướng fix (chờ chốt):** sau refetch re-append các tin `pending`/`failed` còn sống (qua `select`/`structuralSharing` hoặc `queryFn` merge), HOẶC chấp nhận mất (đơn giản). **Test:** tạo 1 tin "Gửi lỗi" → tắt/bật mạng → xem còn không.

### C — dedupe hụt optimistic vs FCM (CHƯA FIX)
`appendToInfinite` dedupe theo `id`. Optimistic mang `randomId`, FCM mang `realId` → khác id → nếu FCM `NewMessage(realId)` về **trước** lúc confirm đổi `randomId→realId` → append bản 2 → trùng tin + trùng React key. BE đã loại sender khỏi recipient nên chủ yếu xảy ra **multi-tab cùng user**.
**Hướng fix:** dedupe phụ theo `(contactId + content + createdTime≈)` cho tin của mình chưa confirm, hoặc bỏ qua self-echo FCM.

---

## 🛠 Changelog phiên 2026-06-28 (UI/UX + audit fixes)

### 1. Timeout gửi tin (KHÔNG phải bug)
`SEND_REQUEST_TIMEOUT_MS=5000` wire đúng: `sendMessage(...,requestTimeout)` → `fetch.ts` axios `timeout`. Đã verify bằng harness: server treo → abort đúng **5010ms**; cổng đóng/kill BE → `ECONNREFUSED` **5ms (tức thì)**. → "Gửi lỗi ngay" khi kill BE là **đúng semantics** (refused fail tức thì), 5s chỉ là **trần cho request đã kết nối nhưng treo**. Muốn test abort thật: thêm `await Task.Delay(20000)` ở handler `/messages/.../send`.

### 2. UI "Gửi lỗi" (`MessageContent.tsx` + `messagemenu_slide.css`)
- Thời gian tin lỗi neo lại đúng bubble: chuyển khối "Gửi lỗi" ra **ngoài** container `.relative` (anchor của `.message-time`) → không đẩy lệch time.
- Tin `failed` **không hiện menu chức năng** (chặn edit-btn + `MessageMenu_Slide` bằng `!message.failed`) — tránh thao tác trên message chưa có trong DB. Chỉ hiện **1 nút copy** (`message-copy-btn`, hover scale-in tại `right:90%`).

### 3. Badge "đã chỉnh sửa" (`MessageContent.tsx` + `messagemenu_slide.css`)
Bỏ text `(edited)` cạnh giờ → **badge icon bút chì** (`fa-pen`, nền `bg-gray-400`) nổi ở **góc trên** giống badge ghim. Vừa ghim vừa edit → đẩy badge edited vào trong (`right-[1.15rem]`/`left-[1.15rem]`) cạnh badge ghim, không đè.

### 4. Audit fixes (non-network) — xem bảng "Audit đợt 2" ở trên
- **B** `notificationHandlers.ts` `onNewConversation`: `filterConversations` mirror từ `old.filterConversations`.
- **D** `useSendMessage.ts`: gửi `conversationId` thay `conversation?.id ?? ""`; gỡ `useConversation` thừa.
- **E** `useChatboxScroll.ts`: thêm param `conversationId` + `useLayoutEffect` reset `pendingPrepend` khi đổi convo.
- **F** `Chatbox.tsx`: `markRead` effect dep theo `messages[last]?.id` thay cả mảng.

### 5. Search tin nhắn (`InformationSearch.tsx`)
- Mention `@[name]` render đúng style (xanh `text-light-blue-600`, bỏ `@[]`) đồng bộ MessageItem, **kèm highlight keyword** trong tên → hàm mới `renderContent(text, keyword)`.
- Xoá trắng ô search → clear list (`onChange` reset khi value rỗng).
- Mở panel (toggle vào) → clear cả ô input (uncontrolled, qua `refInput.reset()`) + list, rồi mới focus (`resetSearch()`).

### ⏳ Còn nợ sau phiên này
- **A 🟠** refetch-merge xoá tin optimistic (network) — cần chốt "giữ tin lỗi qua refetch" hay "chấp nhận mất".
- **C 🟡** dedupe optimistic vs FCM multi-tab (realtime).
- Nghiệm thu runtime thủ công (mục "⏳ CÒN LẠI" ở trên) vẫn chưa chạy.
- Enhancement tuỳ chọn: retry-on-click tin "Gửi lỗi", abort timeout upload media.

---

## Lệnh hữu ích
```
cd client && npx vite build           # build (esbuild, KHÔNG typecheck)
cd client && npx tsc --noEmit         # typecheck (bỏ qua lỗi useRef pre-existing)
# test helper messageCache (không có test runner trong repo, dùng tsx của pnpm store):
node client/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/cli.mjs <test.ts>
```

## Rủi ro/rollback
Mỗi batch là thay đổi độc lập, revert được theo file. Blast-radius lớn nhất là shape cache (đã bọc qua
helper + có test). Nếu lỗi realtime/optimistic → kiểm tra `utils/messageCache.ts` trước.
