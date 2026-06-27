# Banner thông báo in-app (foreground) + điều hướng khi click

> Mode: FRONTEND (chính) + BACKEND (enrich payload). Khi đang mở app, FCM `onMessage`
> không tự hiện banner OS → render in-app toast clickable cho 3 loại event, gated theo
> settings. Click → điều hướng đúng đích.

## Yêu cầu
1. **Tin nhắn mới** — group: "ai gửi tin nhắn đến nhóm nào"; 1-1: "ai gửi cho bạn". Click → mở hội thoại.
2. **Lời mời kết bạn** — click → `/connections?tab=requests`.
3. **Reaction** — "ai thả cảm xúc vào tin của bạn". Click → nhảy tới đúng tin trong hội thoại.

Phạm vi: foreground (in-app toast). Banner OS khi tab nền do FCM tự hiển thị (không xử lý thêm).

## Spec banner (đều gated `pushEnabled` + per-type)

> **Gate chung:** không banner khi `pushEnabled` tắt HOẶC khi đang ở trang
> conversations (`pathname` bắt đầu `/conversations`) — đang chat thì không làm phiền.
> Banner vẫn hiện ở các trang khác (settings/connections/notifications).

| Event | Điều kiện riêng | Nội dung | Click → |
|---|---|---|---|
| `NewMessage` | `notifyOnMessage`, sender≠mình | "*Tên* — đã gửi tin nhắn đến *Nhóm*" / "…đến bạn" | `/conversations/$id` |
| `NewFriendRequest` | `notifyOnFriendRequest` | "*Tên* — đã gửi cho bạn lời mời kết bạn" | `/connections?tab=requests` |
| `NewReaction` | `notifyOnReaction`, `messageOwnerId==me`, reactor≠mình, type≠rỗng | "*Tên* — đã thả [emoji] vào tin nhắn của bạn" | `/conversations/$id?messageId=…` |

## Thay đổi

### Backend (enrich payload — FE/SW không phải lookup)
| File | Thay đổi |
|---|---|
| `Application/WebSocketEvents/ChatEventModels.cs` | `EventNewFriendRequest` thêm `ContactName/ContactAvatar`; thêm model `EventNewReaction` (ReactorId/Name/Avatar, MessageOwnerId, Type, counts) |
| `Presentation/Friend/AddFriend.cs` | set `ContactName/ContactAvatar` = sender |
| `Infrastructure/BackgroundJobs/NotificationConsumer.cs` | `HandleNewReaction` load message+reactor **1 lần**, gửi `EventNewReaction` (thay vì raw model), tái dùng cho persist; `PersistReactionNotification` → trả bool, chỉ `SaveAsync` khi thực thêm |
| `Application/Notifications/NotificationBanner.cs` | banner OS reaction/friend-request dùng tên actor (đã có trong payload) |

### Frontend
| File | Thay đổi |
|---|---|
| `src/utils/inAppNotification.tsx` (mới) | `buildBanner(event,data,info)` thuần (gate + dựng spec + đích nav) + `showBannerToast` (react-toastify clickable) |
| `src/context/SignalContext.tsx` | `useNavigate` + `navigateRef`; sau `classifyNotification` gọi `buildBanner`→`showBannerToast`; `goToBannerTarget` điều hướng typed |
| `src/routes/_layout.conversations.$conversationId.tsx` | `validateSearch` nhận `messageId?` |
| `src/components/conversation/Chatbox.tsx` | đọc `?messageId` → `getElementById` cuộn + highlight, retry vài nhịp (tin async), clear param sau khi nhảy |
| `src/styles/messagecontent.css` | `.message-highlight` pulse 2.2s |
| `src/types/notification.types.ts` | `NewReaction` thêm field enrich; thêm `NewFriendRequest` |

### Chỉ báo tab khi tab ẩn — 🗑️ ĐÃ GỠ
Chấm đỏ "nhịp tim" trên tiêu đề/favicon (và phần điều hướng khi click banner OS) đã được
**gỡ bỏ hoàn toàn**:
- Xóa `src/utils/tabBadge.ts`; gỡ listener chỉ báo tab ở `SignalContext.tsx`.
- `public/firebase-messaging-sw.js` **revert về baseline** (bỏ `skipWaiting`/`clients.claim`/
  `notificationclick`/`postMessage`) — các thêm thắt này từng làm Brave mất FCM push subscription.

> Banner in-app foreground (các mục trên) **không bị ảnh hưởng**, vẫn hoạt động. `passesNotificationGate`
> vẫn dùng cho banner. Chi tiết việc gỡ: [`TONG_KET_THONG_BAO.md`](./TONG_KET_THONG_BAO.md) §6.

## Quyết định / lưu ý
- **Reaction → nhảy đúng message**: dùng `getElementById(message.id)` (root message đã có `id`). Tin **quá cũ chưa load** → no-op graceful (vẫn ở trong hội thoại); không build lại infinite-load quanh message ở pass này.
- **Stale closure**: navigate + info đều qua ref → subscription chỉ re-register theo `info.id`; banner luôn dùng settings + router state mới nhất. (Nối tiếp fix [[project_apply_settings_feature]].)
- **Reaction broadcast cho mọi member** (đồng bộ count) nhưng banner chỉ hiện cho chủ tin nhờ `messageOwnerId`.
- `EventNewReaction` không còn field `userId` (đổi thành `reactorId`); đã verify không FE consumer nào đọc `reaction.userId`. Count-sync (`onNewReaction`) vẫn nguyên field.

## Validate
- BE: `dotnet build Chat.API` → 0 error.
- FE: `tsr generate` + `tsc --noEmit` → chỉ còn 3 lỗi **pre-existing** (AddMembersModal/CreateGroupChatModal useRef), không liên quan.
- ⚠️ Cần **restart BE** (nạp payload mới) để reaction/friend banner có tên actor.
