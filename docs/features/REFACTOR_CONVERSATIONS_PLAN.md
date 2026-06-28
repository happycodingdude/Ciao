# Refactor trang Conversations — Kế hoạch chi tiết

> MODE: REFACTORING · Phương án **C (full)** + chiến lược refetch **merge** (đã chốt với product).
> Ngày: 2026-06-28. Trạng thái: **CHỜ DUYỆT trước khi code** (feature lớn, blast-radius rộng).

---

## Phase 1 — Phạm vi & kiến trúc hiện tại

Luồng đang chạy thực tế:

```
_layout.conversations.tsx (loader: ensureQueryData ["conversation"], xoá localStorage conversationId)
 ├─ ListChatHeaderContainer
 ├─ ListChatContainer        ← list ĐANG DÙNG (router <Link> + useActiveConversation + pagination thủ công)
 └─ Outlet → _layout.conversations.$conversationId.tsx (loader: mark unSeen=false)
      └─ ChatboxContainer (prevConvId module-scope, Ctrl+F search)
           ├─ ChatboxHeader / ChatInput / Information / Attachment / InformationSearch
           └─ Chatbox → useMessage + useChatboxScroll (pagination thủ công qua refPage)

Realtime: FCM onMessage → notificationHandlers.onNewMessage/onNewReaction/... ghi thẳng ["message", id]
```

Dead code song song: `ListChat.tsx` → `ListchatContent.tsx` (bản cũ localStorage + ghi phantom key), `ToggleNotification.jsx` — không còn import ở đâu.

---

## Phase 2 — Inventory bug & code smell (severity cao → thấp)

| # | Mức | Loại | Vấn đề | Vị trí |
|---|-----|------|--------|--------|
| 1 | 🔴 | Bug | Phantom cache keys `["message"]`/`["attachment"]` thiếu `conversationId` → ghi vào key không ai đọc | ListchatContent:63-64, ChatboxHeader:51, FriendCtaButton:109, SideBarMenu_Mobile:42 |
| 2 | 🔴 | Bug | 2 observer `useMessage` khác page cùng key, `page` không nằm trong queryKey → refetch non-deterministic, mất trang cũ | route.$conversationId:80, Chatbox:55, useMessage:5 |
| 3 | 🔴 | Bug | Auto-scroll xuống đáy vô điều kiện khi có tin mới → cướp vị trí đọc lịch sử | Chatbox:91-94 |
| 4 | 🟠 | Bug | `fetchMoreMessages` không try/finally → throw thì isFetching kẹt + lockScroll không nhả → list đơ | useChatboxScroll:35-86 |
| 5 | 🟠 | Bug | refetchOnMount + staleTime 120s + pagination thủ công → quay lại sau 120s reset page 1, mất trang | useMessage:11 |
| 6 | 🟠 | Refactor | Dead code: ListChat, ListchatContent, ToggleNotification.jsx, comment block 60 dòng ChatboxContainer:64-126 | — |
| 7 | 🟡 | Bug | `isPhoneScreen()` gọi trong render, không reactive resize | ChatInput:155, ChatboxHeader:33 |
| 8 | 🟡 | Bug | Đọc field không nhất quán: ChatboxContainer:59 `filterConversations` vs nơi khác `conversations` | — |
| 9 | 🟡 | Refactor | Lặp lookup `conversations.find(c=>c.id===id)` ≥4 file | Chatbox, ChatInput, Header, useSendMessage |
| 10 | 🟡 | Bug | Gửi fail → pending kẹt mãi, không error UI/retry | useSendMessage:146 |
| 11 | 🟡 | Perf | `groupMessagesByDate` không memo, chạy mỗi render | Chatbox:154 |
| 12 | 🟡 | Fragile | `useEventListener(scroll,…,ref.current)` lần đầu ref=null gắn nhầm window | useChatboxScroll:88, ListChatContainer |
| 13 | 🟢 | Refactor | `console.log("Fetching conversations")` production | route.tsx:14 |
| 14 | 🟢 | Bug | markRead gọi cả khi tin cuối là của mình | Chatbox:139 |
| 15 | 🟢 | Refactor | `String.replace("{page}", number)` coercion ngầm | message.service:26 |
| 16 | 🟢 | Smell | `prevConvId` module-scope `let` global mutable | ChatboxContainer:18 |

---

## Phase 3 — Core của phương án C: chuyển sang `useInfiniteQuery`

### Blast radius (đã đo)
**19 điểm đọc/ghi `["message", id]` trên 8 file** giả định shape phẳng `MessageCache`:
notificationHandlers (5), useDirectMessage (5), useMessageActions (4), useChatboxScroll (2), AddMembersModal (1), + 2 phantom-key ở dead/legacy.

### Nguyên tắc giảm rủi ro: KHÔNG để `InfiniteData` lộ ra 19 call-site
Tạo module `utils/messageCache.ts` bọc toàn bộ thao tác. Mọi nơi gọi helper, không đụng shape:

```ts
// Shape mới: InfiniteData<MessagePage> với MessagePage = { messages, hasMore, nextPage }
// pages[0] = cũ nhất … pages[n] = mới nhất (khớp UI: prepend lên đầu)
appendMessage(qc, convId, msg)            // tin mới (gửi/nhận realtime) → page cuối
updateMessageById(qc, convId, id, patch)  // edit/recall/react/pin/confirm-send
removeMessageById(qc, convId, id)
getFlatMessages(qc, convId): Pending[]    // đọc phẳng cho logic cần toàn bộ
replaceMessageId(qc, convId, tmpId, realId, patch) // confirm optimistic send
```

Tất cả call-site cũ refactor về các helper trên. `Chatbox` đọc qua `data.pages.flatMap(p => p.messages)` (memo hoá).

### Pagination
- Bỏ `useChatboxScroll.fetchMoreMessages` + `refPage`. Dùng `fetchPreviousPage` của infinite query (load tin CŨ hơn khi cuộn lên đỉnh).
- `getPreviousPageParam` lấy từ `hasMore`/page index. Giữ scroll-anchor (prepend không nhảy) bằng cách đo `scrollHeight` trước/sau trong `useLayoutEffect`.
- Refetch-merge: infinite query khi stale tự refetch **tất cả** trang đã load → thoả "merge" tự nhiên, không mất trang. Đặt `staleTime` hợp lý + `refetchOnMount: 'always'` an toàn vì merge.

### Realtime (#5)
- `onNewMessage` khi inactive: thay `invalidateQueries(refetchType:inactive)` bằng `appendMessage` trực tiếp (cache nhất quán, không cần refetch). Khi active: cũng `appendMessage`. → loại bỏ rủi ro reset trang.

---

## Phase 4 — So sánh phương án (đã chọn C)

| | A minimal | B moderate | **C full (chọn)** |
|---|---|---|---|
| Fix bug #1-#5 | ✓ | ✓ | ✓ |
| Refactor sạch #6-#11 | ✗ | ✓ | ✓ |
| useInfiniteQuery + realtime-append | ✗ | ✗ | ✓ |
| Risk hồi quy | thấp | thấp-TB | **cao** |
| Maintainability dài hạn | + | ++ | +++ |
| Effort | 0.5d | 1.5d | 3-4d |

Trade-off chấp nhận: rủi ro cao đổi lấy bỏ hẳn pagination thủ công + cache phẳng dễ vỡ.

---

## Phase 5 — Kế hoạch thực thi theo batch (mỗi batch = 1 commit revert được)

### Batch 0 — Dọn dẹp an toàn (zero behavior change)
- Xoá dead code #6: `ListChat.tsx`, `ListchatContent.tsx`, `ToggleNotification.jsx`, comment block ChatboxContainer.
- Xoá #13 console.log. Sửa #15 ép `String()`.
- Xoá 2 phantom-key writer còn sống không cần thiết (FriendCtaButton/SideBarMenu nếu là legacy) hoặc sửa key (#1).

### Batch 1 — Bug correctness độc lập (chưa đụng infinite query)
- #3 auto-scroll: chỉ scroll khi gần đáy hoặc tin của chính mình.
- #4 try/finally cho fetch (tạm thời, sẽ bị thay ở Batch 3).
- #8 thống nhất đọc `conversations`. #14 markRead bỏ qua tin của mình. #1 ChatboxHeader attachment key.

### Batch 2 — Helper layer
- Tạo `utils/messageCache.ts` + types `MessagePage`/`InfiniteMessageData`.
- Viết unit test nhỏ cho từng helper (append/update/replaceId/remove + idempotent).

### Batch 3 — Migrate sang useInfiniteQuery (CORE, rủi ro cao)
- Viết lại `useMessage` → `useInfiniteQuery`. Update `getMessages` trả `nextPage`/`hasMore`.
- Refactor `Chatbox` đọc `pages.flatMap`, memo grouping (#11).
- Viết lại scroll anchoring (thay `useChatboxScroll` pagination) — load-previous khi chạm đỉnh, giữ vị trí.
- Migrate 19 call-site sang helper. Bỏ observer `useMessage(id,1)` ở route (#2). `refetchOnMount` an toàn (#5).
- `onNewMessage` inactive: append thay invalidate.

### Batch 4 — UX & polish
- #7 `useIsPhoneScreen()` reactive (resize listener). #10 error state gửi fail + retry. #12 fix listener attach (truyền ref, không `.current`). #16 prevConvId → context/sessionStorage.

---

## Phase 6 — Risk & rollback

| Risk | Phòng ngừa |
|------|-----------|
| Sai shape InfiniteData làm vỡ realtime/optimistic | Helper layer + unit test Batch 2 TRƯỚC khi migrate |
| Scroll-anchor nhảy khi load trang cũ | `useLayoutEffect` đo scrollHeight; test thủ công cuộn lên nhiều trang |
| Refetch toàn bộ pages tốn băng thông convo dài | Giới hạn maxPages của infinite query (RQ v5 `maxPages`) |
| Mất optimistic khi refetch-merge | replaceMessageId giữ pending tới khi confirm; test gửi khi mạng chậm |
| Hồi quy reaction/pin/edit/recall realtime | Smoke test từng event qua 2 tab |

**Test checklist thủ công bắt buộc trước merge:** đổi hội thoại liên tục · cuộn lên load nhiều trang · gửi text/media (mạng chậm) · nhận tin khi active/inactive · react/pin/edit/recall qua 2 tab · resize/xoay màn hình · offline→online reconnect.

---

## Phase 7 — Trạng thái
- [x] Duyệt kế hoạch → bắt đầu Batch 0
- [x] Batch 0-1 (an toàn) · [x] Batch 2 (helper+test) · [x] Batch 3 (core) · [x] Batch 4 (polish)

> ✅ ĐÃ HOÀN THÀNH (2026-06-28). Chi tiết những gì đã đổi: xem mục dưới.

---

## Tổng kết thực thi

### Files thêm mới
| File | Vai trò |
|------|---------|
| `client/src/utils/messageCache.ts` | Lớp helper bọc `InfiniteData<MessageCache>` (append/update/remove/flatten/mutatePages + wrapper QueryClient). Gom 19 call-site về ~6 hàm. |
| `client/src/hooks/useIsPhoneScreen.ts` | Hook reactive thay `isPhoneScreen()` (useSyncExternalStore + resize). |

### Files xoá (dead code)
`ListChat.tsx`, `ListchatContent.tsx`, `ToggleNotification.jsx`.

### Thay đổi cốt lõi
- `useMessage` → **useInfiniteQuery** (`messageQueryOption` 1 tham số). pages chronological [cũ…mới] qua `fetchPreviousPage`. `getNextPageParam=undefined` (tin mới qua realtime append). Thêm `messageFirstPageQueryOption` (key `["message","review",id]`) cho pane review notification.
- `useChatboxScroll` — bỏ pagination thủ công (refPage + ghi cache). Dùng `fetchPreviousPage` + scroll-anchor `useLayoutEffect`. Gắn listener deterministic qua state node (#12).
- `Chatbox` — đọc `flattenInfinite(data)` (memo), memo grouping, auto-scroll có guard near-bottom/own-message (#3), markRead bỏ tin của mình (#14).
- `notificationHandlers` — realtime append thay `invalidate-inactive`; react/pin → `updateMessageById`; edit/recall → `mutateMessagePages`.
- Migrate cache writes sang helper: `useSendMessage`, `useMessageActions`, `usePinMessage`, `useDirectMessage`, `AddMembersModal`, `FriendCtaButton` (sửa phantom key + shape), `SideBarMenu_Mobile` (xoá no-op), `ChatboxHeader` (#1 attachment key).
- `useSendMessage` — try/catch upload+send → đánh dấu `failed` + toast (#10); MessageContent hiển thị "Gửi lỗi".

### Kiểm thử đã chạy
- `vite build` ✅ · `tsc --noEmit` chỉ còn lỗi **pre-existing** `useRef()` (AddMembersModal, CreateGroupChatModal) — không phải do refactor.
- Helper `messageCache.ts`: 14 assertion qua `tsx` (ordering/append-to-last/dedupe/update-cross-page/remove/map/undefined-safe) ✅.

### Còn lại / quyết định giữ nguyên
- `#16 prevConvId` module-scope `let`: GIỮ NGUYÊN (hành vi survive-remount đã được document có chủ đích; đổi sang storage rủi ro > lợi ích).
- `isPhoneScreen()` vẫn dùng ở 16 file NGOÀI trang conversations (auth/sidebar/profile…) — ngoài scope, không đổi.

### ⚠️ Cần test thủ công (runtime — build/type không phủ)
Đổi hội thoại liên tục · cuộn lên load nhiều trang (giữ vị trí) · gửi text/media mạng chậm + mất mạng (thấy "Gửi lỗi") · nhận tin khi active/inactive · react/pin/edit/recall qua 2 tab · resize/xoay màn hình · offline→online reconnect (refetch-merge không mất trang).
