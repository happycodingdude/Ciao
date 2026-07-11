# Phase 3 — Handoff: tiến độ & việc còn lại

> **Cập nhật:** 2026-07-11 · Nguồn kế hoạch: [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)
> **Lưu ý phạm vi:** Trạng thái hoạt động (Idle/Invisible) đã **bỏ khỏi Phase 3** theo yêu cầu (2026-07-09).

## Tổng quan tiến độ

| Đợt | Tính năng | Backend | Frontend | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Ghim cuộc trò chuyện | ✅ Xong | ✅ Xong | **Đã nghiệm thu app thật (2026-07-11)** — xem [`GHIM_HOI_THOAI_VA_BOOKMARK.md`](./GHIM_HOI_THOAI_VA_BOOKMARK.md) |
| 1 | Bookmark (tin đã lưu) | ✅ Xong | ✅ Xong | Trang `/saved` + menu tin nhắn + panel trong hội thoại; **đã nghiệm thu app thật (2026-07-11)** |
| 2 | Media tabs (Ảnh/Video/File/Link) | ✅ Xong (endpoint links) | ✅ Xong — **đã nghiệm thu app thật (2026-07-11)** | 4 section Information + 4 tab `Attachment.tsx` + preselect tab — xem [`MEDIA_TABS_REDESIGN.md`](./MEDIA_TABS_REDESIGN.md) |
| 2 | Đặt biệt danh | ✅ Xong | ⬜ Chưa làm | FE: UI sửa trong `InformationMembers.tsx` + hiển thị nickname + case realtime |
| 3 | Đổi hình nền chat | ✅ Xong (rev 2: conversation-level) | ✅ Code xong rev 2 — **chưa verify E2E (BE chưa chạy)** | Theme CHUNG cả hội thoại + sync realtime — xem [`TUY_CHINH_DOAN_CHAT.md`](./TUY_CHINH_DOAN_CHAT.md) |
| 3 | Theme chat (màu bong bóng) | ✅ Xong (rev 2: conversation-level) | ✅ Code xong rev 2 — **chưa verify E2E (BE chưa chạy)** | 5 preset AA-contrast + override chữ màu trong bubble — xem [`TUY_CHINH_DOAN_CHAT.md`](./TUY_CHINH_DOAN_CHAT.md) |
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

### Đợt 2a — Media tabs redesign (✅ HOÀN THÀNH — user đã nghiệm thu app thật 2026-07-11)

**Đã implement đủ 6 bước bảng dưới.** Verify: `tsc` sạch, `npm run build` OK, Vite dev transform OK; **user đã nghiệm thu trực tiếp trên app thật (2026-07-11)** — bao gồm cả fix thumbnail Links bên dưới. Mục này giữ lại làm tham chiếu, không còn việc tồn đọng.

Files đã đổi: `context/ChatDetailTogglesContext.tsx` (thêm `attachmentTab` + `openAttachment`), `hooks/useConversationLinks.ts` (mới), `components/conversation/MediaItems.tsx` (mới: `FileRow`/`LinkRow`/`VideoThumb`/`formatBytes`), `Attachment.tsx` (4 tab), `InformationAttachments.tsx` (4 section).

**Known issue (2026-07-11) — ĐÃ FIX (2026-07-11):** thumbnail trong section/tab Links hiện icon ảnh vỡ (link CELLPHONES) dù bubble tin nhắn hiện ảnh bình thường. **Root cause:** `imageUrl` từ BE là path proxy tương đối (`/api/v1/link-preview/image?...`) — `LinkPreviewCard` có logic prefix `VITE_ASPNETCORE_CHAT_URL`, còn `LinkRow` dùng raw nên browser resolve về origin FE (:5000) → 404. **Fix:** tách helper `resolveLinkPreviewImageSrc` (`utils/linkPreview.ts`, mới) dùng chung cho `LinkPreviewCard.tsx` + `LinkRow` (`MediaItems.tsx`); kèm `onError` → fallback icon `fa-link` + `referrerPolicy="no-referrer"` phòng ảnh proxy vẫn lỗi. Đã nghiệm thu cùng đợt 2a trên app thật (2026-07-11).

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

**Verify (MODE FRONTEND — ✅ đã nghiệm thu 2026-07-11):** build sạch; hội thoại đủ 4 loại media → 4 section đúng loại ≤8 item; từng View all mở đúng tab; đóng/mở lại từ header icon default Images; đang ở tab Videos/Links gửi attachment mới → tab KHÔNG nhảy về Images; đổi hội thoại khi panel mở → không request links thừa; Load more hoạt động; light/dark + width hẹp (4 nút fit); console/network sạch.

### Đợt 2b — Biệt danh

1. `InformationMembers.tsx`: nút sửa (✏️) cạnh member → input đặt biệt danh (≤50 ký tự, BE validate sẵn), gọi `updateMemberNickname`, patch cache bằng `updateConversationMember`.
2. Hiển thị: ưu tiên `member.nickname` thay `contact.name` trong tin nhắn nhóm (`MessageContent.tsx`), danh sách member, mention… (chỉ trong hội thoại đó).
3. Realtime: thêm case `MemberNicknameChanged` vào `utils/notificationHandlers.ts` (payload: conversationId, contactId, nickname, changedBy) → patch member trong cache `["conversation"]`.

### Đợt 3 — Hình nền + màu bong bóng (rev 2 ĐÃ CODE 2026-07-11 — **CHƯA VERIFY E2E, BE cần restart**)

Doc nghiệp vụ: [`TUY_CHINH_DOAN_CHAT.md`](./TUY_CHINH_DOAN_CHAT.md).

**Rev 2 (2026-07-11, theo yêu cầu user):** theme chuyển từ per-user (Member) sang **CHUNG cả hội thoại (Conversation-level)** + tăng contrast chữ màu trong bubble.

BE (build 0 lỗi):

- `Conversation.cs`: thêm `Wallpaper`/`BubbleColor` (Member đã BỎ 2 field này — doc cũ ignore nhờ IgnoreExtraElementsConvention, không migration; data rev 1 per-user không chuyển).
- DTO `ConversationWithTotalUnseenWithContactInfo(-AndNoMessage)` + `ConversationCacheModel`: thêm 2 field; `MemberWithContactInfo` bỏ 2 field.
- Aggregation `GetConversationsWithUnseenMesages`: `$group` `$first` + `$project` 2 field conversation-level (thiếu là mất theme khi warmup re-login), bỏ khỏi Members push.
- `UpdateConversationAppearance.cs`: set trên Conversation root (không arrayFilter), patch Redis conversation-info cache (`GetConversationInfo`→`SetConversation`), **fanout `ConversationAppearanceChanged`** (data-only) cho member khác — pattern UpdateNickname.
- `ChatEventNames.ConversationAppearanceChanged` + `EventConversationAppearanceChanged {ConversationId, Wallpaper, BubbleColor, ChangedBy}`.

FE (build sạch; 4 lỗi tsc pre-existing không liên quan):

- `types/conv.types.ts`: `wallpaper/bubbleColor` chuyển từ member → `ConversationModel`.
- `useConversationAppearance`: đọc từ conversation, patch `updateConversationInCache` (vẫn optimistic + rollback; **BE set CẢ 2 field mỗi call → luôn gửi kèm field không đổi**).
- `notificationHandlers.ts`: case `ConversationAppearanceChanged` → patch conversation trong cache (payload null = mặc định).
- Contrast: `getBubbleClass` trả `chat-bubble-custom chat-bubble-{key}`; `.chat-bubble-custom` trong `chatAppearance.css` ép trắng các text màu trong bubble (`.text-light-blue-500/600` mention + reply/forward header, `.text-green-500` View more + underline, `[class*="border-l-light-blue"]` vạch quote) — selector 2 class thắng utility, không cần `!important`. Màu preset chỉnh đậm hơn đạt AA với chữ trắng: teal `#0f766e`, amber `#b45309`, rose `#be123c`.
- UI: subtitle "Áp dụng cho mọi thành viên trong đoạn chat" dưới heading Customize chat.

**Việc còn lại để đóng đợt 3:** restart BE (Docker daemon đang tắt — cần user mở Docker/approve quyền) → verify E2E: 2 account 2 browser context, A đổi theme → B thấy ngay không reload; reload giữ theme; contrast reply/mention/View more trong bubble màu; regression harness Playwright cũ (scratchpad session 2026-07-11: login `/auth`, click `.anticon-info-circle` mở panel).

### Đợt 4 — Last Seen

1. Dữ liệu đã có: `member.contact.lastActiveTime` (null khi online hoặc bị ẩn — BE đã mask privacy).
2. Hiển thị "Hoạt động x phút/giờ trước" (dayjs fromNow) tại: header chatbox, `Information.tsx`, có thể cả `ConversationItem` (thay dot offline).
3. Không hiển thị khi `lastActiveTime` null.

### Việc chung khi hoàn tất từng đợt

- Thêm case realtime nếu có event mới. (`MessageMenu.tsx` cũ đã XÓA — không còn dùng; menu tin nhắn duy nhất là `MessageMenu_Slide.tsx`, đã có nút Lưu tin nhắn.)
- Verify theo CLAUDE.md MODE FRONTEND: build + chạy app + Playwright + console/network sạch.
- Cập nhật trạng thái `PRODUCT_ROADMAP.md` + tài liệu tính năng tương ứng.
