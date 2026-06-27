# SEARCH_MESSAGES

## Mục đích

Cho phép user tìm tin nhắn theo keyword trong 1 conversation cụ thể.

## Luồng hoạt động

1. Frontend gọi `GET /api/v1/conversations/{id}/messages/search?keyword=...&page=1&limit=20`.
2. `Validator` kiểm tra:
   - User hiện tại phải là member của conversation `{id}` (reuse rule `ContactRelatedToConversation`).
   - `keyword` không được rỗng/whitespace.
3. `Handler` gọi `IConversationRepository.SearchMessages` → trả về `List<MessageSearchResult>`.
4. Repository chạy aggregation pipeline trên collection `Conversation`:
   - `$match _id == conversationId` (hit primary index)
   - `$unwind Messages`
   - `$match Messages.Type == "text"` + regex `i` trên `Messages.Content`
   - `$sort CreatedTime desc`, `$skip`, `$limit`
   - `$replaceRoot` để Messages thành document gốc
   - `$project` lấy id, type, content, contactId, createdTime
5. Kết quả deserialize qua `BsonSerializer.Deserialize<MessageSearchResult>`.

## Frontend

- Service: `searchMessages(conversationId, keyword)` trong [client/src/services/message.service.ts](../client/src/services/message.service.ts)
- Type: `MessageSearchResult` trong [client/src/types/message.types.ts](../client/src/types/message.types.ts)
- Component: [client/src/components/conversation/InformationSearch.tsx](../client/src/components/conversation/InformationSearch.tsx)
  - **Render độc lập như sibling** của [Information](../client/src/components/conversation/Information.tsx) và [Attachment](../client/src/components/conversation/Attachment.tsx) trong sidebar phải — KHÔNG nằm trong cây JSX của Information
  - Conditional render `{showSearch && <InformationSearch />}` đặt ở [ChatboxContainer](../client/src/components/layouts/ChatboxContainer.tsx) — giữ state input/results chỉ khi search active
  - Component tự túc: đọc `conversationId` từ route, đọc `showSearch` qua context — không nhận props
  - Overlay absolute chiếm toàn bộ vùng sidebar phải khi `showSearch=true` (z-10), ẩn sau (z-0) khi false. Cùng layer với Information/Attachment.
  - Header chỉ hiển thị tiêu đề "Search messages" — KHÔNG có nút back. User đóng panel bằng cách click lại icon Search trên `ChatboxHeaderMenu` (`toggleDetail("search")` flip về null).
  - Search input dùng [CustomInput](../client/src/components/common/CustomInput.tsx) để đồng nhất visual với thanh search trong AddMembersModal (flat, underline animation khi focus); auto-focus thủ công qua `refInput` trong `useEffect([showSearch])` — focus mỗi khi panel hiện ra, không chỉ lần mount đầu (component always-mounted). Gọi `focus({ preventScroll: true })` để chặn browser scroll-into-view trên ancestor scrollable trong lúc sidebar đang transition `w-0` → `sidebar-w`, tránh chat list/chatbox bị xê dịch 1 thoáng.
  - Trigger search: nhấn Enter trên input hoặc click icon `SearchOutlined` đặt cùng hàng; icon mờ + `pointer-events-none` khi keyword rỗng hoặc đang loading
  - `handleKeyDown` guard `e.nativeEvent.isComposing` để chặn double-fire khi dùng IME (Vietnamese/Japanese/Chinese/Korean) — pattern giống [IME_BUG_FIX.md](../bug-fixes/IME_BUG_FIX.md)
  - Render kết quả theo nhóm tháng: mỗi nhóm có 1 separator căn trái, hiển thị "This month" / "Last month" / "MMMM" (cùng năm) / "MMMM YYYY" (khác năm)
  - Mỗi kết quả: avatar người gửi (lookup từ `conversation.members` qua `contactId`) bên trái; bên phải gồm tên + thời gian ở hàng trên, content highlight keyword ở hàng dưới
  - Format thời gian từng message: trong ngày hôm nay → `HH:mm`; khác ngày → `DD/MM`
  - `contactById` Map được memo theo `(conversations, conversationId)` để tránh build lại khi user gõ keyword
  - Grouping memo theo `results` — key dùng `YYYY-MM`, label dùng `formatMonthLabel` (so sánh `startOf("month")` để chỉ tính theo tháng)
- Trigger: icon `SearchOutlined` trong hàng action icon của [ChatboxHeaderMenu](../client/src/components/conversation/ChatboxHeaderMenu.tsx) (desktop) và [ChatboxHeaderMenu_Mobile](../client/src/components/conversation/ChatboxHeaderMenu_Mobile.tsx) (mobile)
- **State mutually exclusive trong [ChatDetailTogglesContext](../client/src/context/ChatDetailTogglesContext.tsx)**: 1 string `activeDetail: "search" | "information" | "attachment" | null`. Mỗi thời điểm chỉ 1 panel active. Context expose derived boolean `showSearch`/`showInformation`/`showAttachment` cho consumer chỉ cần đọc đúng panel của mình.
- **Persist localStorage**: 1 key `"toggleChatDetail"`, value là string nguyên `"search"|"information"|"attachment"`; khi `activeDetail === null` thì `removeItem` (không lưu rỗng). Lazy read 1 lần qua `useMemo` khi mount, validate giá trị đọc về (chỉ chấp nhận đúng 3 string hợp lệ, ngoài ra fallback null). 1 `useEffect` write theo `activeDetail`. Logout ở [auth.service.ts](../client/src/services/auth.service.ts) xoá key này.
- **Click handler**: 1 helper `toggleDetail(kind)` — nếu `activeDetail === kind` thì set null (đóng), ngược lại set kind (mở/replace panel khác).
  - Click Search → `toggleDetail("search")`
  - Click Info → `toggleDetail("information")`
  - Click Attachment → `toggleDetail("attachment")`
- **Active icon state**: vì state đã mutually exclusive, icon active = `showX` trực tiếp, không cần derive priority.
- **Sidebar visibility** ở [ChatboxContainer](../client/src/components/layouts/ChatboxContainer.tsx): `anyPanelOpen = activeDetail !== null` — sidebar collapse `w-0` khi null, ngược lại `sidebar-w`.
- Nút X trong Information panel + back trong Search: `setActiveDetail(null)`.
- View all trong InformationAttachments: `setActiveDetail("attachment")` — 1 lần set là switch sang Attachment.
- Khi user chuyển conversation: `setActiveDetail("information")` — default về panel Information cho mọi conversation switch (effect trong ChatboxContainer). Tracker `prevConvId` đặt ở **module scope** (`let` ngoài component) để survive qua các lần remount do route loader/Suspense, đảm bảo behavior nhất quán dù có fetch lại data hay không. Mount đầu của tab (page reload) **không** trigger default → giữ nguyên `activeDetail` vừa restore từ localStorage.
- Keyboard shortcut: `Ctrl+F` (Windows/Linux) hoặc `Cmd+F` (Mac) — mở nhanh UI Search messages khi đang ở 1 conversation
  - Listener gắn vào `window` trong `useEffect` của [ChatboxContainer.tsx](../client/src/components/layouts/ChatboxContainer.tsx) (luôn mount khi đang ở route conversation, không phụ thuộc Information panel)
  - Hoạt động cả khi focus đang ở chat input hoặc bất cứ đâu trong panel
  - Khi shortcut bắn: `setActiveDetail("search")` — sidebar tự mở vì width logic dựa trên `activeDetail`
  - `e.preventDefault()` để ghi đè find mặc định của browser; loại trừ tổ hợp có Shift/Alt để tránh đụng các shortcut khác trong tương lai
- Endpoint env: `VITE_ENDPOINT_MESSAGE_SEARCH` trong [client/.env](../client/.env)

## Lưu ý khi sử dụng

- Chỉ search message `type == "text"`. Image/system message không có content meaningful.
- Keyword được escape bằng `Regex.Escape` để chống regex injection (user nhập `.*`, `[a-z]+`...).
- Regex case-insensitive trên embedded array KHÔNG hit index → nếu lượng message lớn cần cân nhắc tạo text index riêng (không trivial trên embedded array). Để hướng cải thiện future.
- Pagination dùng `PagingParam` chuẩn (page, limit). Default `limit=20` từ `AppConstants.DefaultLimit`.
- Cache (Redis MessageCache) KHÔNG được dùng cho search — DB là source of truth, đảm bảo kết quả luôn đầy đủ kể cả với message cũ đã evict khỏi cache.
