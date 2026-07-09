# Phase 3 — Handoff: tiến độ & việc còn lại

> **Cập nhật:** 2026-07-09 · Nguồn kế hoạch: [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)
> **Lưu ý phạm vi:** Trạng thái hoạt động (Idle/Invisible) đã **bỏ khỏi Phase 3** theo yêu cầu (2026-07-09).

## Tổng quan tiến độ

| Đợt | Tính năng | Backend | Frontend | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Ghim cuộc trò chuyện | ✅ Xong | ✅ Xong | Chờ restart BE + verify E2E — xem [`GHIM_HOI_THOAI_VA_BOOKMARK.md`](./GHIM_HOI_THOAI_VA_BOOKMARK.md) |
| 1 | Bookmark (tin đã lưu) | ✅ Xong | ✅ Xong | Trang `/saved` + menu tin nhắn; chờ verify E2E |
| 2 | Media tabs (Ảnh/Video/File/Link) | ✅ Xong (endpoint links) | ⬜ Chưa làm | FE: thêm tab Video + Link vào `Attachment.tsx` |
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

### Đợt 2a — Media tabs (`client/src/components/conversation/Attachment.tsx`)

1. Thêm 2 tab: **Video** (filter `type === "video"`, upload BE đã hỗ trợ video/mp4|mov) và **Liên kết**.
2. Tab Liên kết: query mới `["links", conversationId]` gọi `getConversationLinks` (đã có trong `bookmark.service.ts`), render thẻ (favicon/ảnh + title + url), click mở tab mới; empty state riêng.
3. Cân nhắc đồng bộ preview `InformationAttachments.tsx`.

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
