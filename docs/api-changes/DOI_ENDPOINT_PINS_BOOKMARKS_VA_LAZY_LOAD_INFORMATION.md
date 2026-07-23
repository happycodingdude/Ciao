# Đổi endpoint danh sách Pin/Bookmark về `/pins` `/bookmarks` + Lazy-load panel Information

Ngày: 2026-07-23

Gộp 3 yêu cầu liên quan tới tính năng Ghim (Pin) / Đã lưu (Bookmark) và tối ưu panel
"Chat information".

## Trạng thái
- ✅ **Backend** — build sạch (0 error). Đổi 2 route danh sách + dời 2 route id.
- ✅ **Frontend** — build sạch (`vite build` OK). Đổi 4 biến `.env` + thêm lazy-load theo viewport.
- ⏳ **Runtime** — cần restart Vite dev server (env bake lúc khởi động) + BE mới để nghiệm thu.

---

## 1. Đổi tên endpoint danh sách (item 1 + 2)

Mục tiêu: route danh sách "tin đã ghim" / "tin đã lưu" ngắn gọn, đối xứng nhau.

| Chức năng | Trước | Sau |
|---|---|---|
| Danh sách tin **đã ghim** (phân trang) | `GET .../conversations/{id}/messages/pinned` | `GET .../conversations/{id}/pins` |
| Danh sách tin **đã lưu** (phân trang) | `GET .../conversations/{id}/bookmarks/messages` | `GET .../conversations/{id}/bookmarks` |

### Đụng route → dời endpoint id xuống sub-path
Trước đó `/pins` và `/bookmarks` đang được endpoint **id** (badge "đã ghim"/"đã lưu" inline)
chiếm giữ. Nếu để danh sách trùng vào đó, ASP.NET sẽ ném `AmbiguousMatchException`. Vì vậy
dời 2 route id xuống một segment con:

| Chức năng (id inline) | Trước | Sau |
|---|---|---|
| Id các tin đã ghim trong hội thoại | `GET .../conversations/{id}/pins` | `GET .../conversations/{id}/pins/ids` |
| Id các tin đã lưu trong hội thoại | `GET .../conversations/{id}/bookmarks` | `GET .../conversations/{id}/bookmarks/ids` |

Route danh sách (`/pins`, `/bookmarks`) và route id (`/pins/ids`, `/bookmarks/ids`) khác số
segment → không đụng nhau. Method / phân quyền / request / response **giữ nguyên**.

### File thay đổi (BE)
- `Presentation/Conversation/GetPinnedMessages.cs` → `{id}/pins`
- `Presentation/Conversation/GetConversationPinnedIds.cs` → `{conversationId}/pins/ids`
- `Presentation/Bookmark/GetConversationBookmarks.cs` → `{conversationId}/bookmarks`
- `Presentation/Bookmark/GetConversationBookmarkIds.cs` → `{conversationId}/bookmarks/ids`

### `.env` (FE) — giá trị hiện tại
```
VITE_ENDPOINT_MESSAGE_PINNED             = '/conversations/{id}/pins?page={page}&limit={limit}&keyword={keyword}'
VITE_ENDPOINT_CONVERSATION_PINNED_IDS    = '/conversations/{id}/pins/ids'
VITE_ENDPOINT_CONVERSATION_BOOKMARK_MESSAGES = '/conversations/{id}/bookmarks?page={page}&limit={limit}&keyword={keyword}'
VITE_ENDPOINT_CONVERSATION_BOOKMARK_IDS  = '/conversations/{id}/bookmarks/ids'
VITE_ENDPOINT_CONVERSATION_LINKS         = '/conversations/{id}/links'   # KHÔNG phân trang (xem §2a-2)
```
> Tiện thể bổ sung `{page}`/`{limit}` cho `..._BOOKMARK_MESSAGES` (trước chỉ có `{keyword}`):
> service đã `.replace("{page}"/"{limit}")` nhưng placeholder không tồn tại → load-more panel
> "Tin đã lưu" trước đây không gửi được phân trang (luôn trả page 1). Nay đã khớp.

### Triển khai (tránh 404 giao thời)
BE mới expose route mới; FE cũ còn gọi route cũ → 404. Deploy BE + FE gần nhau. Không có
migration dữ liệu (chỉ đổi đường dẫn, collection `Pin`/`Bookmark` giữ nguyên).

---

## 2. Lazy-load panel "Chat information" (item 3)

**Vấn đề:** panel Information (và các panel phải) LUÔN mounted (ẩn bằng z-index/width), nên
các section gọi API ngay cả khi user chưa mở panel / chưa cuộn tới. Nặng nhất: `getAttachments`
chạy **mỗi lần mở hội thoại** dù chưa mở panel nào — vì cả `Attachment.tsx` lẫn
`InformationAttachments.tsx` gọi `useAttachment` mà không gate.

**Giải pháp:** hook `useInView` (IntersectionObserver, latch 1 lần, reset theo `conversationId`)
+ gate `enabled` của từng query.

| Section | API | Điều kiện fetch (mới) |
|---|---|---|
| InformationAttachments | `getAttachments` + links | `showInformation && !willReset && inView` |
| Attachment (View all) | `getAttachments` | `showAttachment && !willReset` |
| InformationInvite | `getGroupInvite` | `showInformation && !willReset && inView` |
| InformationJoinRequests | `getJoinRequests` | `showInformation && !willReset && inView` |
| InformationMembers / InformationAppearance | — (đọc cache) | không đổi |

Ghi chú kỹ thuật:
- `IntersectionObserver` tính cả phần bị clip bởi scroll-container cha → section dưới "fold"
  của panel = chưa nhìn thấy → chưa fetch.
- `InformationJoinRequests` ẩn hẳn khi rỗng (`return null`) → dùng "mốc vô hình" (div 0-kích-thước,
  inline style ghi đè border/padding của panel cha) để observer vẫn bắt được vị trí cuộn.
- `useAttachment` thêm tham số `enabled` (mặc định `true`) — 2 caller dùng chung query key
  `["attachment", id]`, chỉ fetch khi có ít nhất 1 observer bật.

### File thay đổi (FE)
- `client/src/hooks/useInView.ts` (mới)
- `client/src/hooks/useAttachment.ts` (thêm `enabled`)
- `client/src/components/conversation/Attachment.tsx`
- `client/src/components/conversation/InformationAttachments.tsx`
- `client/src/components/conversation/InformationInvite.tsx`
- `client/src/components/conversation/InformationJoinRequests.tsx`

---

## 2a. Fix lazy-load `links` bị gọi sớm (kiểm chứng trên app thật)

**Triệu chứng (user báo):** mở hội thoại / bung hết section → các section media nằm tít dưới fold
nhưng API vẫn call.

**Đo bằng Network thật:** `InformationAttachments` render 4 section Ảnh/Video/File/Link. Media
(Ảnh/Video/File) dùng CHUNG endpoint `/attachments`, còn Link là endpoint `/links` RIÊNG. Bug:
cả hai bị gate CHUNG một mốc IntersectionObserver (đặt ở header Images) → hễ Images lọt vào tầm
nhìn là `/links` cũng bị gọi, dù section Links ở tận đáy (đo được top≈1071 khi fold≈633).

**Fix:**
- Tách **mốc riêng cho Links** (`linksRef`) đặt tại chính section Links → `/links` chỉ gọi khi
  cuộn tới Links.
- Bỏ `if (isLoading) return <spinner>` (dùng loading inline từng section) — early-return làm
  unmount/remount các mốc khiến observer bám nhầm node cũ (detached) → mốc dưới fold không kích.
- `useAttachment` gate theo mốc media (`mediaRef` ở Images), `useConversationLinks` gate theo
  `linksRef`.

**Kết quả kiểm chứng (localhost, Network tab):**
| Tình huống | `/attachments` | `/links` |
|---|---|---|
| Mở, media dưới fold (Members bung, Images top≈1075) | KHÔNG gọi | KHÔNG gọi |
| Mở, Images sát mép visible (top≈611) | gọi (Images visible) | KHÔNG gọi (Links tận đáy) |
| Cuộn tới media / tới Links | gọi khi tới | gọi khi tới Links |

`pins/ids` + `bookmarks/ids`: mỗi cái đúng **1 call** (fix double-call OK — đã verify).

## 2a-2. Links: BỎ HẲN phân trang — luôn trả ALL (2026-07-23, ✅ đã nghiệm thu)

**Bối cảnh:** trước đây `/links` có 2 nhánh (`limit<=0` trả all cho preview; `limit>0` phân trang
cho panel "View all"). Rà lại thấy paging **không cần thiết**: nguồn là `MessageCache` in-memory
nên BE **đằng nào cũng materialize toàn bộ link** rồi mới `Skip/Take` — paging chỉ là overhead
thừa, còn mọi tab anh em (Images/Videos/Files) vốn đã lấy hết 1 lần rồi render trong scroll.

**Thay đổi:** gỡ toàn bộ `page`/`limit` khỏi endpoint `/links`.
- **BE** `GetConversationLinks.cs`: `Request(conversationId)` — không còn `page`/`limit`; handler
  luôn trả **tất cả** link (`OrderByDescending CreatedTime`, bỏ tin recall). DTO
  `GetConversationLinksResponse` bỏ field `HasMore` (chỉ còn `Links`).
- **FE** gộp 2 hook thành **một** `useConversationLinks(id, enabled)` (query đơn, key
  `["conversationLinks", id]`). Preview (`InformationAttachments`) và panel "View all"
  (`Attachment`) **dùng chung 1 query key** → warm cache lẫn nhau. Preview `.slice(0, MAX_PREVIEW)`,
  panel render hết trong scroll (bỏ "Load more"/infinite query, bỏ hook `useConversationLinksAll`).
- **Env** `VITE_ENDPOINT_CONVERSATION_LINKS = '/conversations/{id}/links'` (bỏ `?page=&limit=`).
- Service `getConversationLinks(conversationId)` — bỏ tham số `page`/`limit`.

**Verify:** `dotnet build Presentation` → 0 Error; `tsc --noEmit` không phát sinh lỗi ở các file
links đã sửa (chỉ còn lỗi strict-mode có sẵn ở file khác). **✅ Đã nghiệm thu app thật 2026-07-23:**
`GET .../links` (không query param) trả 200, preview cắt `MAX_PREVIEW`, panel "View all" liệt kê hết.

> ⚠️ Cần **restart backend** để route mới (không nhận `page`/`limit`) có hiệu lực.

**Liên quan (fix cùng đợt):** thẻ xem trước link biến mất sau khi ĐĂNG NHẬP LẠI — do projection
warmup cache bỏ rơi `LinkPreview`/`LinkPreviews` (whitelist). Đã vá ở
`ConversationRepository.GetConversationsWithUnseenMesages`; chi tiết & phạm vi (kèm edit/recall) ở
[`../features/PREVIEW_LINK_HANDOFF.md`](../features/PREVIEW_LINK_HANDOFF.md) §11.

## 2b. Fix `/ids` double-call (bổ sung)

**Triệu chứng:** `/pins/ids` (và/hoặc `/bookmarks/ids`) bị gọi nhiều lần.

**Phân tích:** `usePinMessage`/`useBookmark` mount ở NHIỀU nơi — Chatbox (eager) + mỗi
`MessageContent` + mỗi `MessageMenu_Slide` — tất cả trước đây `enabled:true`. Bình thường
`staleTime 5min` + dedupe của react-query → 1 request. NHƯNG khi query ở trạng thái **lỗi/stale**
(vd BE chưa deploy route mới → `/pins/ids` trả 404) hoặc khi **focus lại cửa sổ**
(`refetchOnWindowFocus` mặc định true), mỗi observer mount sau lại kích một request mới → double/nhiều call.

**Fix:** đưa về mô hình **1 nơi fetch duy nhất**:
- Thêm tham số `eager` cho 2 hook. Chỉ Chatbox truyền `eager:true` → fetch đúng 1 lần/hội thoại.
- Observer theo từng message dùng `eager:false` (mặc định) → `enabled:false` → **chỉ đọc cache**,
  không bao giờ tự bắn request (kể cả khi lỗi/stale).
- Thêm `refetchOnWindowFocus:false` cho 2 query (trạng thái đồng bộ qua realtime + optimistic).

File: `usePinMessage.ts`, `useBookmark.ts`, `Chatbox.tsx`.

> Lưu ý phân biệt: `/pins/ids` và `/bookmarks/ids` là **2 endpoint khác nhau**, mỗi cái được gọi
> 1 lần là ĐÚNG. Nếu Network tab thấy 2 dòng cùng kết thúc `/ids` nhưng là `pins/ids` +
> `bookmarks/ids` thì không phải double-call.

## 3. Nghiệm thu runtime (còn lại)
1. Restart Vite dev server + chạy BE mới.
2. Mở 1 hội thoại **không** mở panel Information → DevTools Network: **không** thấy `getAttachments`.
3. Mở panel Information, chưa cuộn xuống → chưa thấy call attachments/links (nếu ở dưới fold).
4. Cuộn tới section Attachments → lúc này mới thấy `GET .../attachments` + `GET .../links`.
5. Hover tin nhắn → badge ghim/đã lưu đúng (route `/pins/ids`, `/bookmarks/ids` trả 200).
6. Mở panel "Tin đã ghim"/"Tin đã lưu" + cuộn load-more → `GET .../pins?page=2`, `.../bookmarks?page=2`.
