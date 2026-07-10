# Phase 3 — Handoff: tiến độ & việc còn lại

> **Cập nhật:** 2026-07-11 · Nguồn kế hoạch: [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)
> **Lưu ý phạm vi:** Trạng thái hoạt động (Idle/Invisible) đã **bỏ khỏi Phase 3** theo yêu cầu (2026-07-09).

## Tổng quan tiến độ

| Đợt | Tính năng | Backend | Frontend | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Ghim cuộc trò chuyện | ✅ Xong | ✅ Xong | Chờ restart BE + verify E2E — xem [`GHIM_HOI_THOAI_VA_BOOKMARK.md`](./GHIM_HOI_THOAI_VA_BOOKMARK.md) |
| 1 | Bookmark (tin đã lưu) | ✅ Xong | ✅ Xong | Trang `/saved` + menu tin nhắn; chờ verify E2E |
| 2 | Media tabs (Ảnh/Video/File/Link) | ✅ Xong (endpoint links) | ✅ Code xong (2026-07-11) | 4 section Information + 4 tab `Attachment.tsx` + preselect tab; build + tsc sạch, chờ verify E2E — xem [`MEDIA_TABS_REDESIGN.md`](./MEDIA_TABS_REDESIGN.md) |
| 2 | Đặt biệt danh | ✅ Xong | ⬜ Chưa làm | FE: UI sửa trong `InformationMembers.tsx` + hiển thị nickname + case realtime |
| 3 | Đổi hình nền chat | ✅ Xong | ⬜ Chưa làm | FE: preset + override CSS var trên `ChatboxContainer` |
| 3 | Theme chat (màu bong bóng) | ✅ Xong | ⬜ Chưa làm | FE: preset + override `--bubble-bg` trong `MessageContent` |
| 4 | Lần hoạt động cuối (Last Seen) | ✅ Xong | ⬜ Chưa làm | FE: hiển thị "hoạt động x trước" khi offline |

**Backend đã build 0 lỗi (`dotnet build MyConnect.sln`), client build OK (`npm run build`).**

## Backend đã có sẵn (không cần làm lại)

Tất cả endpoint dưới đây đã code xong, build sạch, theo pattern PinMessage (Carter + MediatR + Mongo arrayFilter + patch Redis member cache):

| Endpoint | File | Ghi chú |
| --- | --- | --- |
| `PUT /conversations/{id}/pin?pinned=` | `Presentation/Conversation/PinConversation.cs` | PinnedTime trên Member của chính user |
| `PUT /conversations/{cid}/messages/{id}/bookmark?bookmarked=` | `Presentation/Bookmark/BookmarkMessage.cs` | idempotent |
| `GET /bookmarks?page&limit` | `Presentation/Bookmark/GetBookmarks.cs` | resolve nội dung live, `IsUnavailable` khi recall |
| `GET /conversations/{id}/bookmarks` | `Presentation/Bookmark/GetConversationBookmarkIds.cs` | list messageId đã lưu |
| `GET /conversations/{id}/links?page&limit` | `Presentation/Conversation/GetConversationLinks.cs` | cho tab Liên kết (gom LinkPreviews, bỏ tin recall) |
| `PUT /conversations/{cid}/members/{contactId}/nickname` | `Presentation/Member/UpdateNickname.cs` | body `{nickname}`; rỗng = xóa; fanout event `MemberNicknameChanged` |
| `PUT /conversations/{id}/appearance` | `Presentation/Conversation/UpdateConversationAppearance.cs` | body `{wallpaper, bubbleColor}` (key preset, null = mặc định) |

Hạ tầng đi kèm đã xong:

- `Domain/Entities/Member.cs`: thêm `PinnedTime`, `Nickname`, `Wallpaper`, `BubbleColor` (no migration — doc cũ default null).
- `Domain/Entities/Bookmark.cs` + `IBookmarkRepository`/`BookmarkRepository` + DI (`InfrastructureServiceInstaller`).
- Aggregation `GetConversationsWithUnseenMesages` đã project 4 field mới (nếu thiếu sẽ mất data khi warmup cache re-login).
- `MemberWithContactInfo` DTO + member cache patch trong từng handler.
- Event realtime: `ChatEventNames.MemberNicknameChanged` + `EventMemberNicknameChanged` (ChatEventModels.cs).
- Last Seen: `IPresenceService.GetLastActiveAsync` (Redis hash `last_active_users`, ghi khi ping/logout), `UserCache.GetLastActiveVisibleAsync` (mask theo `ShowLastSeen` + `ShowOnlineStatus`), field `lastActiveTime` đã trả trong GetConversations (`member.contact.lastActiveTime`) và danh sách bạn bè.

FE đã chuẩn bị sẵn:

- `.env`: đủ endpoint mới (`VITE_ENDPOINT_CONVERSATION_PIN/APPEARANCE/LINKS`, `MEMBER_NICKNAME`, `MESSAGE_BOOKMARK`, `BOOKMARK_GET`, `CONVERSATION_BOOKMARK_IDS`).
- `services/bookmark.service.ts` (đã có cả `getConversationLinks`), `conv.service.ts` (đã có `pinConversation`, `updateConversationAppearance`, `updateMemberNickname`).
- `types/conv.types.ts`: member đã có `pinnedTime/nickname/wallpaper/bubbleColor`, contact có `lastActiveTime`.
- `types/bookmark.types.ts`: kèm `ConversationLinkItem`.
- `utils/conversationCache.ts`: helper `updateConversationInCache` + `updateConversationMember`.

## Việc còn lại (FE là chính) — khi quay lại làm tiếp

### Đợt 2a — Media tabs redesign (✅ CODE XONG 2026-07-11 — chờ verify E2E)

**Đã implement đủ 6 bước bảng dưới.** Trạng thái verify: `tsc` các file mới sạch, `npm run build` OK, Vite dev transform 5 module mới/sửa OK (FE :5000, BE :4000 đang chạy). CHƯA chạy Playwright E2E (môi trường session không có Playwright MCP) — checklist verify ở cuối mục này vẫn cần chạy tay/Playwright khi có.

Files đã đổi: `context/ChatDetailTogglesContext.tsx` (thêm `attachmentTab` + `openAttachment`), `hooks/useConversationLinks.ts` (mới), `components/conversation/MediaItems.tsx` (mới: `FileRow`/`LinkRow`/`VideoThumb`/`formatBytes`), `Attachment.tsx` (4 tab), `InformationAttachments.tsx` (4 section).

**Known issue (2026-07-11, chưa fix):** thumbnail trong section/tab Links hiện icon ảnh vỡ (link CELLPHONES) — `imageUrl` có giá trị nhưng ảnh tải lỗi (khả năng site chặn hotlink/referrer hoặc URL ảnh hết hạn). Fix dự kiến: thêm `onError` trên `<img>` trong `LinkRow` (`MediaItems.tsx`) để fallback về icon `fa-link` như case thiếu `imageUrl`; cân nhắc thêm `referrerPolicy="no-referrer"` trên `<img>`.

**Yêu cầu chốt:**

1. `Information` tách section Attachments chung thành **4 section riêng: Images, Files, Videos, Links**.
2. `Attachment.tsx` có **4 nút filter trên đầu** (Images/Files/Videos/Links), show đúng loại.
3. Mỗi section Information show **tối đa 8 item** + nút **View all** mở panel Attachment **đúng tab tương ứng**.

**Thứ tự implement:**

| # | Việc | File |
| --- | --- | --- |
| 1 | Thêm `AttachmentTabKind` (`image\|file\|video\|link`), state `attachmentTab` (default `image`, KHÔNG persist localStorage) + helper `openAttachment(tab)` = set tab + `setActiveDetail("attachment")` | `context/ChatDetailTogglesContext.tsx` |
| 2 | Hook `useConversationLinks(conversationId, limit, enabled)` — `useInfiniteQuery`, queryKey `["conversationLinks", id, limit]`, `getNextPageParam` theo `hasMore`, staleTime 120s | `hooks/useConversationLinks.ts` (mới) |
| 3 | Component dùng chung: `FileRow` (icon + tên + size qua `formatBytes` helper mới), `LinkRow` (thumbnail 32px + title + siteName, `<a target="_blank" rel="noopener noreferrer">`, layout theo `InformationBookmark.tsx` row), `VideoThumb` (`<video preload="metadata" muted>` + overlay play, click mở mediaUrl — lightbox không hỗ trợ video) | `components/conversation/MediaItems.tsx` (mới) |
| 4 | 4 tab từ config array, giữ class `.custom-button/selected`; thay state local bằng `attachmentTab` context; **XÓA 2 effect reset cũ (lines ~41-51)** thay bằng 1 effect duy nhất `if (!showAttachment) setAttachmentTab("image")` (không clobber preselection, refetch nền không kéo về tab Images); filter bucket ngày bằng `useMemo`; tab Link: `useConversationLinks(id, 20, showAttachment && tab==="link" && !willResetPanelOnConversation(id))`, nhóm theo ngày + nút Load more khi `hasNextPage`; empty state đổi text theo tab | `components/conversation/Attachment.tsx` |
| 5 | Bỏ `useEffect+setState`, `useMemo` flatten 1 lần → partition `images/videos/files = flat.filter(type).slice(0,8)`; Links: `useConversationLinks(id, 8, showInformation && ...)` đọc page 1; 4 section header luôn hiện, thân rỗng → 1 dòng text muted (không dùng emptybox.svg to); mỗi View all gọi `openAttachment(tab)`; Images giữ grid 4 cột lightbox (slides thuần ảnh, hết filenotfound.svg), Videos grid `VideoThumb`, Files/Links list row | `components/conversation/InformationAttachments.tsx` |
| 6 | Docs: cập nhật file này + tạo `MEDIA_TABS_REDESIGN.md` (doc nghiệp vụ) + `PRODUCT_ROADMAP.md` | `docs/features/` |

**Lý do thiết kế chính:**

- Preselect tab qua **context state** (không phải module ref) vì `Attachment.tsx` luôn mounted (ẩn bằng z-index), cần re-render ngay khi bấm View all lúc data đã cache.
- Attachments filter **client-side** trên cache `useAttachment` sẵn có (BE trả tất cả, type `image/file/video` đã tag từ `Upload.cs`) — không cần sửa BE. Riêng **Links** dùng endpoint phân trang riêng `getConversationLinks` (service + types đã có sẵn, hiện CHƯA được consume ở đâu).
- `limit` nằm trong queryKey nên cache preview (limit=8) và cache panel (limit=20) không đụng nhau.

**Verify (MODE FRONTEND):** build sạch; hội thoại đủ 4 loại media → 4 section đúng loại ≤8 item; từng View all mở đúng tab; đóng/mở lại từ header icon default Images; đang ở tab Videos/Links gửi attachment mới → tab KHÔNG nhảy về Images; đổi hội thoại khi panel mở → không request links thừa; Load more hoạt động; light/dark + width hẹp (4 nút fit); console/network sạch.

### Đợt 2b — Biệt danh

1. `InformationMembers.tsx`: nút sửa (✏️) cạnh member → input đặt biệt danh (≤50 ký tự, BE validate sẵn), gọi `updateMemberNickname`, patch cache bằng `updateConversationMember`.
2. Hiển thị: ưu tiên `member.nickname` thay `contact.name` trong tin nhắn nhóm (`MessageContent.tsx`), danh sách member, mention… (chỉ trong hội thoại đó).
3. Realtime: thêm case `MemberNicknameChanged` vào `utils/notificationHandlers.ts` (payload: conversationId, contactId, nickname, changedBy) → patch member trong cache `["conversation"]`.

### Đợt 3 — Hình nền + màu bong bóng

1. Định nghĩa preset FE (key → giá trị): wallpaper (vd. gradient/màu/pattern) và bubbleColor (bộ màu đạt tương phản, hoạt động cả light/dark).
2. UI chọn trong panel `Information.tsx` (mục "Tùy chỉnh đoạn chat"), gọi `updateConversationAppearance`, patch cache member của mình.
3. Áp dụng: đọc `selfMember.wallpaper/bubbleColor` → inline CSS var trên root `ChatboxContainer.tsx` (`--chat-bg-from/to` hoặc backgroundImage; `--bubble-bg` cho tin của mình trong `MessageContent.tsx` line ~279). Luôn có "Mặc định" để reset (gửi null).
4. Ảnh nền quá sáng/tối → lớp phủ giữ khả năng đọc (theo kế hoạch).

### Đợt 4 — Last Seen

1. Dữ liệu đã có: `member.contact.lastActiveTime` (null khi online hoặc bị ẩn — BE đã mask privacy).
2. Hiển thị "Hoạt động x phút/giờ trước" (dayjs fromNow) tại: header chatbox, `Information.tsx`, có thể cả `ConversationItem` (thay dot offline).
3. Không hiển thị khi `lastActiveTime` null.

### Việc chung khi hoàn tất từng đợt

- Thêm case realtime nếu có event mới. (`MessageMenu.tsx` cũ đã XÓA — không còn dùng; menu tin nhắn duy nhất là `MessageMenu_Slide.tsx`, đã có nút Lưu tin nhắn.)
- Verify theo CLAUDE.md MODE FRONTEND: build + chạy app + Playwright + console/network sạch.
- Cập nhật trạng thái `PRODUCT_ROADMAP.md` + tài liệu tính năng tương ứng.
